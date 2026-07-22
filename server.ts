import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL } from "./server/ai/model";

dotenv.config();

const app = express();
// A plataforma de deploy (EasyPanel/Docker) injeta a porta via env.
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Healthcheck — usado pelo Docker/EasyPanel para saber se o container subiu.
// Responde antes de qualquer dependência externa (Supabase/Gemini) para que o
// container seja considerado saudável mesmo com integrações não configuradas.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Lazy-loaded Gemini client to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getGemini(): { ai: GoogleGenAI | null; error?: string } {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    return { ai: null, error: "GEMINI_API_KEY não configurada no painel de Secrets." };
  }
  
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return { ai: aiClient };
}

// -------------------------------------------------------------------
// 1. ENGINE DE TRIAGEM AUTOMÁTICA (CONFORME REGRAS DE CÁLCULO)
// -------------------------------------------------------------------

interface CriterioRequisito {
  criterio: string;
  eliminatorio?: boolean;
  peso: number;
}

interface VagaRequisitos {
  id?: string;
  processo_seletivo_id?: string;
  entidade: "FIESC" | "SESI" | "SENAI" | "IEL";
  cargo: string;
  tipo_contrato?: string;
  localizacao?: string;
  requisitos_obrigatorios: CriterioRequisito[];
  requisitos_desejaveis: CriterioRequisito[];
  descricao?: string;
}

// Cálculo local ponderado para garantir exatidão matemática (Regra de cálculo 2)
function computeWeightedScore(candidateDesc: string, vaga: VagaRequisitos) {
  const textToSearch = candidateDesc.toLowerCase();
  
  let totalWeightedScore = 0;
  let maxPossibleWeight = 0;
  let atendeObrigatorios = true;
  
  const requisitosAtendidos: string[] = [];
  const requisitosNaoAtendidos: string[] = [];

  // Requisitos Obrigatórios: peso de critério * 2 (Regra 2: peso efetivo 2x maior)
  const reqsObrigatorios = vaga.requisitos_obrigatorios || [];
  reqsObrigatorios.forEach((req) => {
    const pesoEfetivo = (req.peso || 3) * 2;
    maxPossibleWeight += pesoEfetivo;
    
    // Simple heuristic synonym dictionary for robust local matching
    const keywords = req.criterio.toLowerCase().split(/[\s,()/]+/).filter(w => w.length > 3);
    const isMet = keywords.some(kw => textToSearch.includes(kw)) || textToSearch.includes(req.criterio.toLowerCase());
    
    if (isMet) {
      totalWeightedScore += pesoEfetivo;
      requisitosAtendidos.push(req.criterio);
    } else {
      requisitosNaoAtendidos.push(`${req.criterio} (Não evidenciado no currículo)`);
      if (req.eliminatorio) {
        atendeObrigatorios = false;
      }
    }
  });

  // Requisitos Desejáveis: peso de critério * 1
  const reqsDesejaveis = vaga.requisitos_desejaveis || [];
  reqsDesejaveis.forEach((req) => {
    const pesoEfetivo = req.peso || 3;
    maxPossibleWeight += pesoEfetivo;
    
    const keywords = req.criterio.toLowerCase().split(/[\s,()/]+/).filter(w => w.length > 3);
    const isMet = keywords.some(kw => textToSearch.includes(kw)) || textToSearch.includes(req.criterio.toLowerCase());
    
    if (isMet) {
      totalWeightedScore += pesoEfetivo;
      requisitosAtendidos.push(req.criterio);
    } else {
      requisitosNaoAtendidos.push(req.criterio);
    }
  });

  const finalScore = maxPossibleWeight > 0 ? Math.round((totalWeightedScore / maxPossibleWeight) * 100) : 50;
  
  let recomendacao: "avancar" | "revisar_manual" | "nao_recomendado" = "revisar_manual";
  if (!atendeObrigatorios) {
    recomendacao = "nao_recomendado";
  } else if (finalScore >= 75) {
    recomendacao = "avancar";
  } else if (finalScore < 45) {
    recomendacao = "nao_recomendado";
  }

  return {
    score_aderencia: finalScore,
    atende_requisitos_obrigatorios: atendeObrigatorios,
    requisitos_atendidos: requisitosAtendidos.length ? requisitosAtendidos : ["Experiência de mercado"],
    requisitos_nao_atendidos: requisitosNaoAtendidos,
    recomendacao
  };
}

// API de triagem inteligente (Unificado para suporte Solo e Lote)
app.post("/api/evaluate", async (req, res) => {
  const { candidato, candidatos, vaga } = req.body;
  if (!vaga) {
    return res.status(400).json({ error: "O parâmetro 'vaga' é obrigatório." });
  }

  // Se for uma lista de candidatos (Modo Lote)
  if (candidatos && Array.isArray(candidatos)) {
    const results = candidatos.map((cand) => {
      const cvText = `${cand.nome} ${cand.experiencia} ${cand.formacao} ${(cand.habilidades || []).join(" ")}`.toLowerCase();
      const localEval = computeWeightedScore(cvText, vaga);

      const devText = `O candidato ${cand.nome} obteve um score de ${localEval.score_aderencia}% na avaliação ponderada para a vaga de ${vaga.cargo || vaga.titulo || "Analista"}. ${
        localEval.atende_requisitos_obrigatorios 
          ? "Atende a todas as exigências eliminatórias e demonstra competências alinhadas com o perfil de atuação da entidade." 
          : "Não apresenta evidências suficientes de requisitos eliminatórios críticos no histórico."
      }`;

      return {
        candidato_id: cand.id,
        processo_seletivo_id: vaga.processo_seletivo_id || vaga.id || "proc_lote",
        score_aderencia: localEval.score_aderencia,
        atende_requisitos_obrigatorios: localEval.atende_requisitos_obrigatorios,
        requisitos_atendidos: localEval.requisitos_atendidos,
        requisitos_nao_atendidos: localEval.requisitos_nao_atendidos,
        devolutiva: devText,
        recomendacao: localEval.recomendacao
      };
    });

    // Ordena por score_aderencia decrescente conforme RF-C03/RF-B02
    results.sort((a, b) => b.score_aderencia - a.score_aderencia);
    return res.json({ resultados: results });
  }

  // Caso seja candidato único
  if (!candidato) {
    return res.status(400).json({ error: "Faltam parâmetros 'candidato' ou 'candidatos' para processar." });
  }

  const cvText = `${candidato.nome} ${candidato.experiencia} ${candidato.formacao} ${(candidato.habilidades || []).join(" ")}`.toLowerCase();
  const localEval = computeWeightedScore(cvText, vaga);

  const { ai } = getGemini();
  if (!ai) {
    // Retorno simulado mas obedecendo as regras de cálculo e formato de saída padrão
    const devText = `[Simulação] O candidato ${candidato.nome} apresenta compatibilidade de ${localEval.score_aderencia}% com a vaga de ${vaga.cargo || vaga.titulo}. Atende ${localEval.requisitos_atendidos.length} critérios requisitados pela regional do ${vaga.entidade}.`;
    return res.json({
      candidato_id: candidato.id,
      processo_seletivo_id: vaga.processo_seletivo_id || vaga.id || "proc_1",
      score_aderencia: localEval.score_aderencia,
      atende_requisitos_obrigatorios: localEval.atende_requisitos_obrigatorios,
      requisitos_atendidos: localEval.requisitos_atendidos,
      requisitos_nao_atendidos: localEval.requisitos_nao_atendidos,
      devolutiva: devText,
      recomendacao: localEval.recomendacao
    });
  }

  try {
    const prompt = `
Você é o assistente de IA do ATS do Sistema FIESC. Avalie o candidato contra a vaga fornecida.

REGRAS DE NEGÓCIO INEGOCIÁVEIS:
1. LGPD: NUNCA mencione CPF, telefones ou contatos exatos. Mantenha total confidencialidade.
2. NÃO-DISCRIMINAÇÃO: NUNCA cite ou pese raça, gênero, idade, estado civil ou religião.
3. TRANSPARÊNCIA: Toda classificação precisa de uma devolutiva técnica objetiva de 2 a 4 frases justificando o score e citando requisitos decisivos.
4. REGRAS DE CÁLCULO:
   - Se algum requisito obrigatório eliminatório NÃO for atendido, "atende_requisitos_obrigatorios" DEVE ser false, e a recomendacao DEVE ser "nao_recomendado".
   - O score_aderencia final calculado localmente foi de ${localEval.score_aderencia}%. Utilize um valor próximo baseado na correspondência semântica de habilidades e na rubrica técnica de pesos.

DADOS DA VAGA:
Entidade: ${vaga.entidade}
Cargo/Título: ${vaga.cargo || vaga.titulo}
Requisitos Obrigatórios (Peso 2x): ${JSON.stringify(vaga.requisitos_obrigatorios)}
Requisitos Desejáveis (Peso 1x): ${JSON.stringify(vaga.requisitos_desejaveis)}

CANDIDATO:
Nome: ${candidato.nome}
Histórico: ${candidato.experiencia}
Habilidades/Formação: ${candidato.formacao} | ${JSON.stringify(candidato.habilidades)}

Retorne um JSON válido com a seguinte estrutura exata:
{
  "candidato_id": "${candidato.id}",
  "processo_seletivo_id": "${vaga.id || "processo"}",
  "score_aderencia": ${localEval.score_aderencia},
  "atende_requisitos_obrigatorios": ${localEval.atende_requisitos_obrigatorios},
  "requisitos_atendidos": ${JSON.stringify(localEval.requisitos_atendidos)},
  "requisitos_nao_atendidos": ${JSON.stringify(localEval.requisitos_nao_atendidos)},
  "devolutiva": "A devolutiva de 2 a 4 frases justificando a aderência técnica para o ${vaga.entidade}.",
  "recomendacao": "${localEval.recomendacao}"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            candidato_id: { type: Type.STRING },
            processo_seletivo_id: { type: Type.STRING },
            score_aderencia: { type: Type.INTEGER },
            atende_requisitos_obrigatorios: { type: Type.BOOLEAN },
            requisitos_atendidos: { type: Type.ARRAY, items: { type: Type.STRING } },
            requisitos_nao_atendidos: { type: Type.ARRAY, items: { type: Type.STRING } },
            devolutiva: { type: Type.STRING },
            recomendacao: { type: Type.STRING }
          },
          required: ["candidato_id", "processo_seletivo_id", "score_aderencia", "atende_requisitos_obrigatorios", "requisitos_atendidos", "requisitos_nao_atendidos", "devolutiva", "recomendacao"]
        }
      }
    });

    const parsed = JSON.parse(response.text ? response.text.trim() : "{}");
    res.json(parsed);
  } catch (err: any) {
    console.error("Erro na triagem Gemini:", err);
    res.status(500).json({ error: "Erro na IA de triagem.", details: err.message });
  }
});


// -------------------------------------------------------------------
// 2. FUNÇÃO 1: GERAÇÃO DE QUESTÕES E CASES
// -------------------------------------------------------------------

app.post("/api/assessments/generate", async (req, res) => {
  const { cargo, entidade, competencias_avaliadas, nivel, tipo_prova, contexto_curriculo } = req.body;
  if (!cargo || !entidade || !tipo_prova) {
    return res.status(400).json({ error: "Parâmetros 'cargo', 'entidade' e 'tipo_prova' são obrigatórios." });
  }

  const { ai } = getGemini();
  if (!ai) {
    // Mock local de provas para manter a usabilidade mesmo sem chave de API
    const mockProva = {
      prova_id: `prova_${Date.now()}`,
      questoes: [
        {
          id: "q_1",
          tipo: "objetiva",
          enunciado: `Considerando o contexto operacional do ${entidade} para o cargo de ${cargo}, qual a conduta regulamentar ideal diante de um incidente ou desafio da área de ${competencias_avaliadas?.[0] || "operação"}?`,
          alternativas: [
            "A) Ignorar o fato e aguardar supervisão externa direta.",
            "B) Conduzir protocolo técnico objetivo e registrar o relatório imediatamente.",
            "C) Realizar manutenção improvisada sem autorização do gestor local.",
            "D) Delegar a responsabilidade para funcionários de nível operacional júnior."
          ],
          gabarito: "B",
          competencia: competencias_avaliadas?.[0] || "Conhecimento de Processos"
        },
        {
          id: "q_2",
          tipo: "discursiva",
          enunciado: `[Estudo de Caso] Proponha um plano de ação para resolver um desalinhamento técnico ou pedagógico envolvendo uma equipe ou turma de alunos em atividades de ${competencias_avaliadas?.[1] || "ensino/prática"}. Como você estruturaria as metodologias de mitigação?`,
          rubrica: [
            { criterio: "Adesão ao modelo metodológico da entidade", pontos_max: 5 },
            { criterio: "Clareza das etapas e viabilidade da execução técnica", pontos_max: 5 }
          ],
          competencia: competencias_avaliadas?.[1] || "Resolução de Problemas Complexos"
        }
      ]
    };
    return res.json(mockProva);
  }

  try {
    const prompt = `
Você é o assistente de provas e exames do ATS do Sistema FIESC.
Gere um conjunto de questões personalizadas e contextualizadas para o cargo e entidade informados.

CRITÉRIOS DA ENTIDADE:
- SENAI: Priorize competências técnicas de engenharia, manufatura, e didática pedagógica.
- SESI: Priorize normas regulamentadoras (NRs), saúde ocupacional, segurança do trabalho e educação básica.
- IEL: Priorize potencial de aprendizado rápido, adaptabilidade comportamental e fit com estágio.
- FIESC: Priorize raciocínio institucional, inteligência de mercado e governança corporativa.

DADOS DE ENTRADA:
Cargo/Cargo Alvo: ${cargo}
Entidade: ${entidade}
Competências Avaliadas: ${JSON.stringify(competencias_avaliadas || ["Conhecimento Geral"])}
Nível de Complexidade: ${nivel || "Pleno"}
Tipo de Prova: ${tipo_prova} (objetiva, discursiva ou mista)
Contexto Adicional (Currículo do Candidato para customização do case): ${contexto_curriculo || ""}

INSTRUÇÕES DO JSON:
- Retorne um JSON válido com as questões.
- Se for tipo "objetiva", cada questão DEVE conter enunciado, alternativas (lista com 4 opções) e gabarito (letra da alternativa correta, ex: "A", "B", "C" ou "D").
- Se for tipo "discursiva", cada questão DEVE conter enunciado e rubrica de correção detalhando critérios e pontuação máxima por critério (soma totalizando 10 pontos).
- Permita variação e randomização.

Estrutura do JSON esperado:
{
  "prova_id": "prova_${Date.now()}",
  "questoes": [
    {
      "id": "string",
      "tipo": "objetiva|discursiva",
      "enunciado": "string",
      "alternativas": ["opção A", "opção B", "opção C", "opção D"],
      "gabarito": "letra_do_gabarito",
      "rubrica": [{"criterio": "string", "pontos_max": 5}],
      "competencia": "string"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prova_id: { type: Type.STRING },
            questoes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  tipo: { type: Type.STRING },
                  enunciado: { type: Type.STRING },
                  alternativas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  gabarito: { type: Type.STRING },
                  rubrica: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        criterio: { type: Type.STRING },
                        pontos_max: { type: Type.INTEGER }
                      }
                    }
                  },
                  competencia: { type: Type.STRING }
                },
                required: ["id", "tipo", "enunciado", "competencia"]
              }
            }
          },
          required: ["prova_id", "questoes"]
        }
      }
    });

    const parsed = JSON.parse(response.text ? response.text.trim() : "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao gerar prova inteligente.", details: err.message });
  }
});


// -------------------------------------------------------------------
// 3. FUNÇÃO 2: CORRETOR DE RESPOSTAS E CASES (COM RUBRICA)
// -------------------------------------------------------------------

app.post("/api/assessments/correct", async (req, res) => {
  const { questao, resposta_candidato, gabarito_ou_rubrica } = req.body;
  if (!questao || !resposta_candidato) {
    return res.status(400).json({ error: "Parâmetros 'questao' e 'resposta_candidato' são obrigatórios." });
  }

  const { ai } = getGemini();
  if (!ai) {
    // Correção local rápida
    const isObjective = questao.tipo === "objetiva";
    let score: number;
    let comments: string;

    if (isObjective) {
      const gbr = gabarito_ou_rubrica || questao.gabarito || "B";
      const cleanedAns = resposta_candidato.trim().toUpperCase();
      const isCorrect = cleanedAns.startsWith(gbr.toUpperCase());
      score = isCorrect ? 10 : 0;
      comments = isCorrect ? "Resposta correta e idêntica ao gabarito oficial." : `Resposta incorreta. Gabarito esperado: ${gbr}.`;
    } else {
      score = 8; // Default mock score for essay
      comments = "Boa clareza de ideias e domínio parcial do tema. O candidato demonstra raciocínio técnico, mas faltou aprofundar nos exemplos práticos do dia a dia da indústria.";
    }

    return res.json({
      questao_id: questao.id || "q_1",
      pontuacao_obtida: score,
      pontuacao_maxima: 10,
      detalhamento: [
        {
          criterio: isObjective ? "Aderência ao Gabarito Objetivo" : "Domínio Técnico do Conteúdo",
          pontos: score,
          comentario: comments
        }
      ]
    });
  }

  try {
    const prompt = `
Você é a banca avaliadora inteligente do ATS do Sistema FIESC. Corrija a resposta do candidato com isenção e precisão técnica.

DADOS DA QUESTÃO:
Tipo: ${questao.tipo}
Enunciado: ${questao.enunciado}
Gabarito ou Rubrica Esperada: ${JSON.stringify(gabarito_ou_rubrica || questao.rubrica || questao.gabarito)}

RESPOSTA DO CANDIDATO:
${resposta_candidato}

REGRAS DE CORREÇÃO:
1. Se for objetiva: Comparação direta. Se correta, dê pontuação cheia (ex: 10/10), senão, zero.
2. Se for discursiva/estudo de caso: Pontue de forma justa com base em cada critério da rubrica. Justifique cada nota de forma construtiva. NUNCA penalize por estilo de escrita informal ou estilo de caligrafia pessoal; avalie puramente a aderência do conteúdo técnico ao critério solicitado.

Retorne um JSON válido contendo:
- questao_id: O ID da questão
- pontuacao_obtida: Nota final obtida (ex: entre 0 e 10)
- pontuacao_maxima: Pontuação máxima (ex: 10)
- detalhamento: Array de objetos com os critérios avaliados contendo:
  - criterio: nome do critério
  - pontos: pontos conferidos neste critério
  - comentario: observação técnica sobre o que faltou ou o que estava excelente.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questao_id: { type: Type.STRING },
            pontuacao_obtida: { type: Type.NUMBER },
            pontuacao_maxima: { type: Type.NUMBER },
            detalhamento: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterio: { type: Type.STRING },
                  pontos: { type: Type.NUMBER },
                  comentario: { type: Type.STRING }
                }
              }
            }
          },
          required: ["questao_id", "pontuacao_obtida", "pontuacao_maxima", "detalhamento"]
        }
      }
    });

    const parsed = JSON.parse(response.text ? response.text.trim() : "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: "Erro na correção de resposta.", details: err.message });
  }
});


// -------------------------------------------------------------------
// 4. FUNÇÃO 3: AUDITOR DE INTEGRIDADE, COPIA E PLÁGIO
// -------------------------------------------------------------------

app.post("/api/assessments/integrity", async (req, res) => {
  const { resposta_candidato, respostas_outros_candidatos } = req.body;
  if (!resposta_candidato) {
    return res.status(400).json({ error: "A resposta do candidato é obrigatória para auditar integridade." });
  }

  const { ai } = getGemini();
  if (!ai) {
    // Local mock analysis for fallback integrity
    const hasAICoppyIndicators = resposta_candidato.includes("Portanto,") || resposta_candidato.includes("em suma") || resposta_candidato.includes("vale ressaltar");
    const otherCandResponses = respostas_outros_candidatos || [];
    let isPlagiarized = false;
    
    otherCandResponses.forEach((r: string) => {
      if (r.toLowerCase().trim() === resposta_candidato.toLowerCase().trim()) {
        isPlagiarized = true;
      }
    });

    let score = 10;
    const indicators: string[] = [];

    if (isPlagiarized) {
      score = 95;
      indicators.push("Correspondência textual exata (100% idêntica) com a resposta de outro candidato inscrito.");
    }
    if (hasAICoppyIndicators) {
      score = Math.max(score, 45);
      indicators.push("Estrutura e conectivos excessivamente formais, típicos de geradores de texto por IA (LLM).");
    }

    if (indicators.length === 0) {
      indicators.push("Nenhum padrão de escrita repetitivo, IA ou colagem direta foi identificado no texto.");
    }

    return res.json({
      questao_id: "q_1",
      suspeita_integridade: score,
      indicadores: indicators,
      acao: score >= 50 ? "revisar_manual" : "sem_indicios"
    });
  }

  try {
    const prompt = `
Você é o auditor técnico de integridade e ética do ATS FIESC.
Analise a resposta do candidato para identificar indícios de plágio (cópia de outros candidatos) ou texto integralmente gerado por inteligências artificiais (padrões de escrita artificiais, parágrafos padronizados, clichês de IA).

RESPOSTA DO CANDIDATO ATUAL:
"${resposta_candidato}"

OUTRAS RESPOSTAS COLETADAS NO MESMO PROCESSO (Se houver):
${JSON.stringify(respostas_outros_candidatos || [])}

DIRETRIZES DE AUDITORIA:
- Analise de forma estatística e semântica.
- NÃO afirme culpa ou desclassifique o candidato diretamente (isto é uma decisão de responsabilidade de um recrutador humano).
- Produza um score de suspeita de 0 a 100 baseado na solidez dos indícios.
- Retorne uma lista de indicadores técnicos claros encontrados no texto.

Retorne um JSON válido:
{
  "questao_id": "q_auditoria",
  "suspeita_integridade": 85,
  "indicadores": [
    "Uso sistemático de termos padrão de Large Language Models como 'Em suma', 'É vital ressaltar', etc.",
    "Similaridade de 92% com outra resposta arquivada no banco de candidatos"
  ],
  "acao": "revisar_manual|sem_indicios"
}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questao_id: { type: Type.STRING },
            suspeita_integridade: { type: Type.INTEGER },
            indicadores: { type: Type.ARRAY, items: { type: Type.STRING } },
            acao: { type: Type.STRING }
          },
          required: ["questao_id", "suspeita_integridade", "indicadores", "acao"]
        }
      }
    });

    const parsed = JSON.parse(response.text ? response.text.trim() : "{}");
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: "Erro na auditoria de integridade.", details: err.message });
  }
});

// -------------------------------------------------------------------
// 5. API: ANALISAR VAGA (PREVENÇÃO DE DISCRIMINAÇÃO E SUGESTÕES)
// -------------------------------------------------------------------

app.post("/api/check-job-description", async (req, res) => {
  const { vaga } = req.body;
  if (!vaga) {
    return res.status(400).json({ error: "O parâmetro 'vaga' é obrigatório." });
  }

  const { ai } = getGemini();

  if (!ai) {
    const lowerDesc = JSON.stringify(vaga).toLowerCase();
    const discriminatoryWords = ["idade", "sexo", "gênero", "masculino", "feminino", "solteiro", "casado", "boa aparência", "cor", "raça", "religião"];
    const found: string[] = [];

    discriminatoryWords.forEach(w => {
      if (lowerDesc.includes(w)) {
        found.push(w);
      }
    });

    return res.json({
      seguro: found.length === 0,
      alertas: found.map(f => `Foi encontrada a palavra "${f}" que pode indicar um critério discriminatório implícito se usada para selecionar candidatos.`),
      sugestoes: [
        "Certifique-se de que a vaga expressa apenas requisitos técnicos objetivos.",
        "Para vagas do SESI, destaque certificações de saúde e segurança se pertinente.",
        "Para vagas do SENAI, descreva claramente a área técnica ou docente requerida."
      ]
    });
  }

  try {
    const prompt = `
Você é o assistente de auditoria ética e de qualidade de vagas do Sistema FIESC (SESI, SENAI, IEL, FIESC).
Sua missão é analisar o texto de uma nova vaga de emprego e emitir um relatório preventivo.

DADOS DA VAGA:
Entidade: ${vaga.entidade}
Título: ${vaga.cargo || vaga.titulo}
Requisitos Obrigatórios: ${JSON.stringify(vaga.requisitos_obrigatorios)}
Requisitos Desejáveis: ${JSON.stringify(vaga.requisitos_desejaveis)}
Descrição Completa: ${vaga.descricao || ""}

EXAMINE ATENTAMENTE EM BUSCA DE:
1. Critérios Discriminatórios (Violação do Princípio de Não-discriminação do Sistema FIESC): Requisitos implícitos ou explícitos de gênero, idade limite (ex: "máximo 30 anos"), preferência por estado civil, religião, cor/raça, "boa aparência", região específica de moradia não justificada legalmente, ou requisitos físicos desproporcionais.
2. Clareza e Precisão de Requisitos: Requisitos vagos ou inadequados para a entidade (ex: uma vaga do SENAI que não especifica competências técnicas ou de docência, ou do SESI que não cita normas regulamentadoras aplicáveis se for de engenharia de segurança).
3. Conformidade com a LGPD: Instruções inadequadas aos candidatos (como pedir para anexar foto com RG/CPF na descrição).

Retorne um JSON contendo:
- seguro: boolean (true se a vaga estiver livre de qualquer potencial problema discriminatório ou ético, false se houver alertas).
- alertas: array de strings detalhando os trechos ou conceitos que violam as boas práticas de não-discriminação ou LGPD.
- sugestoes: array de strings propondo melhorias de redação ou acréscimo de requisitos técnicos legítimos para valorizar o perfil ideal para a entidade específica.

Sua resposta DEVE ser estritamente em formato JSON válido que atenda a essa estrutura.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seguro: { type: Type.BOOLEAN },
            alertas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            sugestoes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["seguro", "alertas", "sugestoes"],
        },
      },
    });

    const resultText = response.text ? response.text.trim() : "{}";
    res.json(JSON.parse(resultText));
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao auditar vaga.", details: err.message });
  }
});


// -------------------------------------------------------------------
// 6. API: COMUNICAÇÃO INSTITUCIONAL CUSTOMIZADA
// -------------------------------------------------------------------

app.post("/api/generate-message", async (req, res) => {
  const { candidato, vaga, recomendacao, devolutiva } = req.body;
  if (!candidato || !vaga || !recomendacao) {
    return res.status(400).json({ error: "Parâmetros 'candidato', 'vaga' e 'recomendacao' são obrigatórios." });
  }

  const { ai } = getGemini();

  if (!ai) {
    const entidadeName = vaga.entidade || "Sistema FIESC";
    const saudar = `Olá ${candidato.nome},\n\n`;
    let mensagem: string;
    if (recomendacao === "avancar") {
      mensagem = `Temos o prazer de informar que o seu perfil apresentou excelente aderência para a vaga de ${vaga.cargo || vaga.titulo} no ${entidadeName} (${vaga.regional}). Você avançou para a próxima etapa de entrevistas. Nossa equipe entrará em contato em breve para agendar.\n\nAgradecemos seu interesse em fazer parte do desenvolvimento da indústria catarinense!\n\nAtenciosamente,\nRecrutamento & Seleção ${entidadeName}`;
    } else if (recomendacao === "revisar_manual") {
      mensagem = `Agradecemos sua candidatura para a vaga de ${vaga.cargo || vaga.titulo} no ${entidadeName} (${vaga.regional}). Seu perfil está em análise detalhada por nossos especialistas de recrutamento. Havendo compatibilidade com as próximas etapas, entraremos em contato.\n\nAtenciosamente,\nEquipe de R&S ${entidadeName}`;
    } else {
      mensagem = `Agradecemos sinceramente sua participação no processo seletivo para a vaga de ${vaga.cargo || vaga.titulo} no ${entidadeName} (${vaga.regional}). No momento atual, decidimos seguir com candidatos cujos perfis atendam de forma mais direta aos pré-requisitos específicos desta oportunidade. Seu currículo ficará em nosso banco de talentos para futuras posições.\n\nDesejamos muito sucesso em sua jornada profissional!\n\nAtenciosamente,\nRecrutamento & Seleção ${entidadeName}`;
    }
    return res.json({ message: saudar + mensagem });
  }

  try {
    const prompt = `
Você é o assistente de IA de comunicação do ATS do Sistema FIESC.
Gere uma mensagem profissional, ética e extremamente acolhedora em Português do Brasil para o candidato a seguir.

INFORMAÇÕES:
- Nome do candidato: ${candidato.nome}
- Vaga de Interesse: ${vaga.cargo || vaga.titulo}
- Entidade: ${vaga.entidade}
- Regional: ${vaga.regional || "SC"}
- Status da Avaliação: ${recomendacao} (Valores possíveis: "avancar", "revisar_manual", "nao_recomendado")
- Justificativa da decisão (para referência): ${devolutiva || ""}

DIRETRIZES DE MARCA DA ENTIDADE:
- SENAI: Foco em capacitação profissional, inovação, indústria forte e futuro técnico. Tom educador e estimulante.
- SESI: Foco em qualidade de vida, bem-estar, saúde ocupacional, segurança do trabalho e educação básica. Tom humano, cuidadoso e focado no bem-estar.
- IEL: Foco em impulsionar novos talentos, estágio, carreiras e liderança jovem. Tom dinâmico, motivador e focado no crescimento de carreira.
- FIESC: Foco em governança institucional, desenvolvimento econômico de SC, apoio à federação das indústrias. Tom altamente corporativo, formal e diplomático.

REGRA ABSOLUTA:
- Se recomendacao for "nao_recomendado", forneça um feedback construtivo extremamente respeitoso, sem dar detalhes que possam ferir a autoestima ou soar discriminatórios, incentivando o candidato a se manter atualizado no banco de talentos da entidade específica.
- Jamais mencione dados confidenciais (CPF, e-mails, endereços, etc.).
- Nunca utilize termos informais ou gírias. Mantenha tom institucional impecável.

Gere apenas o texto final da mensagem (e-mail ou carta) para que o recrutador possa copiar ou enviar. Comece direto com a saudação (ex: "Prezado(a) [Nome]..." ou "Olá, [Nome]...").
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    res.json({ message: response.text ? response.text.trim() : "Mensagem não pôde ser gerada." });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao gerar mensagem de feedback.", details: err.message });
  }
});


// Serve frontend assets and start listening
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Import dinâmico de propósito: `vite` é devDependency e não existe na
    // imagem de produção (instalada com --omit=dev). Carregar no topo faria o
    // container quebrar no boot.
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ATS FIESC Copilot server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar o servidor ATS FIESC:", err);
});
