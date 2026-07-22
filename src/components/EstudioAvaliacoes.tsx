import React, { useState, useEffect } from "react";
import { Vaga, Candidato, Questao, Prova, CorrecaoQuestao, ResultadoIntegridade } from "../types";
import { Sparkles, Brain, ClipboardCheck, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, UserCheck, AlertOctagon, Copy, Check } from "lucide-react";

interface EstudioAvaliacoesProps {
  vaga: Vaga | null;
  candidato: Candidato | null;
}

export default function EstudioAvaliacoes({ vaga, candidato }: EstudioAvaliacoesProps) {
  // Config States for Generation
  const [cargo, setCargo] = useState("");
  const [entidade, setEntidade] = useState<"FIESC" | "SESI" | "SENAI" | "IEL">("SENAI");
  const [competencias, setCompetencias] = useState("");
  const [nivel, setNivel] = useState("Pleno");
  const [tipoProva, setTipoProva] = useState<"objetiva" | "discursiva" | "mista">("mista");
  const [useCVContext, setUseCVContext] = useState(true);

  // States for Outputs
  const [isGenerating, setIsGenerating] = useState(false);
  const [prova, setProva] = useState<Prova | null>(null);
  const [selectedQuestao, setSelectedQuestao] = useState<Questao | null>(null);

  // Answer Submission & Correction
  const [respostaCandidato, setRespostaCandidato] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correcao, setCorrecao] = useState<CorrecaoQuestao | null>(null);

  // Integrity Check
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  const [integridade, setIntegridade] = useState<ResultadoIntegridade | null>(null);

  // Clipboard copies
  const [copiedJson, setCopiedJson] = useState<string | null>(null);

  // Synchronize with active vacancy/candidate selection
  useEffect(() => {
    if (vaga) {
      setCargo(vaga.titulo);
      setEntidade(vaga.entidade);
      // derive competencies from requirements
      const derived = vaga.requisitos_obrigatorios
        .slice(0, 2)
        .map(r => r.split(" ").slice(0, 2).join(" "))
        .join(", ");
      setCompetencias(derived || "Análise Técnica, Operação Operacional");
    }
  }, [vaga]);

  // Handle generating customized test questions
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setProva(null);
    setSelectedQuestao(null);
    setCorrecao(null);
    setIntegridade(null);

    const competenciesArray = competencias
      .split(",")
      .map(c => c.trim())
      .filter(c => c !== "");

    let cvText = "";
    if (useCVContext && candidato) {
      cvText = `Candidato: ${candidato.nome}. Experiência: ${candidato.experiencia}. Habilidades: ${candidato.habilidades.join(", ")}`;
    }

    try {
      const response = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cargo,
          entidade,
          competencias_avaliadas: competenciesArray,
          nivel,
          tipo_prova: tipoProva,
          contexto_curriculo: cvText
        })
      });
      const data = await response.json();
      setProva(data);
      if (data.questoes && data.questoes.length > 0) {
        setSelectedQuestao(data.questoes[0]);
        // Prefill a mock response depending on the question to make UX super nice
        prefillResponse(data.questoes[0]);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com a API de geração de questões.");
    } finally {
      setIsGenerating(false);
    }
  };

  const prefillResponse = (q: Questao) => {
    if (q.tipo === "objetiva") {
      setRespostaCandidato(q.gabarito || "B");
    } else {
      if (candidato) {
        setRespostaCandidato(
          `Com base nas práticas recomendadas pela entidade ${entidade}, eu proporia uma intervenção ágil. Em primeiro lugar, realizaríamos um diagnóstico de campo para identificar as lacunas operacionais em ${q.competencia}. Em segundo lugar, aplicaríamos metodologias ativas com foco em resolução de problemas práticos, garantindo que toda a equipe técnica esteja em conformidade regulamentar e com total segurança.`
        );
      } else {
        setRespostaCandidato(
          "Proponho aplicar um treinamento direto e implementar processos de auditoria interna para monitorar o andamento da operação semanalmente."
        );
      }
    }
    setCorrecao(null);
    setIntegridade(null);
  };

  // Correct Answer
  const handleCorrectAnswer = async () => {
    if (!selectedQuestao) return;
    setIsCorrecting(true);
    setCorrecao(null);

    try {
      const response = await fetch("/api/assessments/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questao: selectedQuestao,
          resposta_candidato: respostaCandidato,
          gabarito_ou_rubrica: selectedQuestao.tipo === "objetiva" ? selectedQuestao.gabarito : selectedQuestao.rubrica
        })
      });
      const data = await response.json();
      setCorrecao(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar correção automática.");
    } finally {
      setIsCorrecting(false);
    }
  };

  // Integrity/Fraud check
  const handleCheckIntegrity = async () => {
    if (!respostaCandidato) return;
    setIsCheckingIntegrity(true);
    setIntegridade(null);

    // Mock other responses for plagiarism detection purposes (e.g., exact copy match trigger)
    const otherResponses = [
      "Com base nas práticas recomendadas pela entidade SENAI, eu proporia uma intervenção ágil. Em primeiro lugar, realizaríamos um diagnóstico de campo...",
      "Ignorar o fato e aguardar supervisão externa direta de forma preventiva."
    ];

    try {
      const response = await fetch("/api/assessments/integrity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resposta_candidato: respostaCandidato,
          respostas_outros_candidatos: otherResponses
        })
      });
      const data = await response.json();
      setIntegridade(data);
    } catch (err) {
      console.error(err);
      alert("Erro ao analisar integridade da resposta.");
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  const copyToClipboard = (jsonObj: any, key: string) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopiedJson(key);
    setTimeout(() => setCopiedJson(null), 2000);
  };

  // Presets of answers for recruiter simulation
  const loadPlagiarismPreset = () => {
    setRespostaCandidato(
      "Com base nas práticas recomendadas pela entidade SENAI, eu proporia uma intervenção ágil. Em primeiro lugar, realizaríamos um diagnóstico de campo..."
    );
    setCorrecao(null);
    setIntegridade(null);
  };

  const loadAIPreset = () => {
    setRespostaCandidato(
      "Em suma, é de extrema importância e vital ressaltar que a abordagem holística proposta visa otimizar as sinergias corporativas. Portanto, diante do exposto, mitigaremos os gargalos operacionais com eficácia inabalável."
    );
    setCorrecao(null);
    setIntegridade(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="estudio_avaliacoes_main">
      {/* Configuration Column */}
      <div className="lg:col-span-4 bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Gerador de Provas & Cases</h3>
        </div>

        {/* Info box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
          O assistente gera avaliações sob medida adaptadas à entidade FIESC correspondente, calibrando o nível de exigência pedagógica ou técnica.
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Cargo Alvo</label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Professor de Metalmecânica"
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Entidade</label>
              <select
                value={entidade}
                onChange={(e) => setEntidade(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="SENAI">SENAI</option>
                <option value="SESI">SESI</option>
                <option value="IEL">IEL</option>
                <option value="FIESC">FIESC</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Nível</label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Júnior">Júnior (Estágio)</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior / Especialista</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Competências Avaliadas (separadas por vírgula)</label>
            <input
              type="text"
              value={competencias}
              onChange={(e) => setCompetencias(e.target.value)}
              placeholder="Ex: Didática, Normas NR, Usinagem"
              className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">Formato de Questões</label>
            <div className="grid grid-cols-3 gap-1">
              {(["objetiva", "discursiva", "mista"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoProva(t)}
                  className={`text-[10px] py-1.5 rounded-lg border font-medium transition capitalize cursor-pointer ${
                    tipoProva === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {candidato && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="useCVContext"
                checked={useCVContext}
                onChange={(e) => setUseCVContext(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="useCVContext" className="text-[11px] text-slate-600 cursor-pointer select-none">
                Considerar currículo de <strong className="text-slate-800">{candidato.nome}</strong> para personalizar cases
              </label>
            </div>
          )}

          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !cargo}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-sm shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Criando Prova Personalizada...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Gerar Questões & Cases Técnicos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Questions Output and Workspace Column */}
      <div className="lg:col-span-8 space-y-6">
        {/* Step 1: Questions Listing */}
        {prova ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Caderno de Avaliação Ativo</span>
                <h4 className="text-sm font-bold text-slate-800">Prova ID: {prova.prova_id}</h4>
              </div>
              <button
                onClick={() => copyToClipboard(prova, "prova")}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                {copiedJson === "prova" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copiar JSON de Questões (Função 1)
              </button>
            </div>

            {/* Staggered selector list */}
            <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto">
              {prova.questoes.map((q, idx) => (
                <button
                  key={q.id || idx}
                  onClick={() => {
                    setSelectedQuestao(q);
                    prefillResponse(q);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedQuestao?.id === q.id
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Questão {idx + 1} ({q.tipo === "objetiva" ? "Objetiva" : "Case/Discursiva"})
                </button>
              ))}
            </div>

            {selectedQuestao && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Competência: {selectedQuestao.competencia}
                  </span>
                  {selectedQuestao.tipo === "objetiva" && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      Gabarito Oficial: {selectedQuestao.gabarito}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {selectedQuestao.enunciado}
                </p>

                {/* Alternatives display */}
                {selectedQuestao.tipo === "objetiva" && selectedQuestao.alternativas && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedQuestao.alternativas.map((alt, idx) => {
                      const prefix = ["A", "B", "C", "D"][idx] || "";
                      const isCorrect = selectedQuestao.gabarito === prefix;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs leading-normal transition ${
                            isCorrect
                              ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 font-medium"
                              : "bg-white border-slate-200 text-slate-600"
                          }`}
                        >
                          {alt}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Rubric displays */}
                {selectedQuestao.tipo === "discursiva" && selectedQuestao.rubrica && (
                  <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Rubrica de Correção Ética (Total: 10 pontos)</span>
                    <div className="space-y-1.5">
                      {selectedQuestao.rubrica.map((rub, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                          <span>{rub.criterio}</span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">{rub.pontos_max} pontos max</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
            <div className="bg-indigo-50 p-4 rounded-full text-indigo-500 w-14 h-14 mx-auto flex items-center justify-center">
              <Brain className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Geração de Avaliações Técnicas</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure os parâmetros no menu ao lado e clique em "Gerar Questões & Cases" para produzir um exame com randomização e rubrica de notas customizadas para os processos do Sistema FIESC.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Answer simulator & AI corrector */}
        {selectedQuestao && (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-800">Simulador de Correção & Integridade</h4>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={loadPlagiarismPreset}
                  className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-2 py-1 rounded transition cursor-pointer"
                  title="Simula colagem de resposta idêntica de outro candidato"
                >
                  Carregar Cópia/Plágio
                </button>
                <button
                  onClick={loadAIPreset}
                  className="text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-2 py-1 rounded transition cursor-pointer"
                  title="Simula resposta estruturada por inteligência artificial típica de LLM"
                >
                  Carregar Linguagem de IA
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Resposta Enviada pelo Candidato</label>
              {selectedQuestao.tipo === "objetiva" ? (
                <div className="flex gap-2">
                  {["A", "B", "C", "D"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setRespostaCandidato(opt);
                        setCorrecao(null);
                        setIntegridade(null);
                      }}
                      className={`w-12 h-10 rounded-lg border font-bold text-sm transition cursor-pointer ${
                        respostaCandidato === opt
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={respostaCandidato}
                  onChange={(e) => {
                    setRespostaCandidato(e.target.value);
                    setCorrecao(null);
                    setIntegridade(null);
                  }}
                  placeholder="Escreva ou cole a resposta discursiva para análise da banca técnica..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700 leading-relaxed"
                />
              )}
            </div>

            {/* Action group */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCorrectAnswer}
                disabled={isCorrecting || !respostaCandidato}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {isCorrecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Corrigindo...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Corrigir com Gabarito/Rubrica (Função 2)
                  </>
                )}
              </button>

              {selectedQuestao.tipo === "discursiva" && (
                <button
                  onClick={handleCheckIntegrity}
                  disabled={isCheckingIntegrity || !respostaCandidato}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                >
                  {isCheckingIntegrity ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      Auditar Plágio & Fraude (Função 3)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Correction Output Display */}
            {correcao && (
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Correção Homologada com Sucesso</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase">Nota Obtida:</span>
                    <span className="text-sm font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {correcao.pontuacao_obtida} / {correcao.pontuacao_maxima}
                    </span>
                    <button
                      onClick={() => copyToClipboard(correcao, "correcao")}
                      className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800"
                      title="Copiar JSON de Correção"
                    >
                      {copiedJson === "correcao" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {correcao.detalhamento.map((det, idx) => (
                    <div key={idx} className="bg-white/80 border border-emerald-100/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Criterio: {det.criterio}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">{det.pontos} pontos</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed italic">
                        &ldquo;{det.comentario}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrity Audit Output Display */}
            {integridade && (
              <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-rose-100/60">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    <h5 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Auditoria de Fraude e Linguagem de IA</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 uppercase">Índice de Suspeita:</span>
                    <span className={`text-sm font-extrabold px-2 py-0.5 rounded ${
                      integridade.suspeita_integridade >= 50 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {integridade.suspeita_integridade}%
                    </span>
                    <button
                      onClick={() => copyToClipboard(integridade, "integridade")}
                      className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800"
                      title="Copiar JSON de Integridade"
                    >
                      {copiedJson === "integridade" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Ação Recomendada ao Recrutador:</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      integridade.acao === "revisar_manual" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {integridade.acao === "revisar_manual" ? "REVISÃO MANUAL REQUERIDA" : "NÃO REQUER INTERVENÇÃO"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {integridade.indicadores.map((ind, idx) => (
                      <div key={idx} className="flex gap-1.5 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-rose-100/40 leading-relaxed">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
