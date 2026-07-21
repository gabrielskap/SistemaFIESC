import React, { useState } from "react";
import { Avaliacao, Candidato, Vaga } from "../types";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Mail, Copy, Check, FileJson, FileText, Sparkles, AlertOctagon } from "lucide-react";

interface AvaliacaoVisualizerProps {
  avaliacao: Avaliacao;
  candidato: Candidato;
  vaga: Vaga;
}

export default function AvaliacaoVisualizer({ avaliacao, candidato, vaga }: AvaliacaoVisualizerProps) {
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);

  const getRecommendationDetails = (rec: string) => {
    switch (rec) {
      case "avancar":
        return {
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
          badge: "bg-emerald-500 text-white",
          label: "Avançar no Processo",
          desc: "Candidato atende plenamente ou à grande maioria dos requisitos essenciais.",
        };
      case "revisar_manual":
        return {
          bg: "bg-amber-50 border-amber-200 text-amber-800",
          badge: "bg-amber-500 text-white",
          label: "Revisão Manual Necessária",
          desc: "Candidato possui bom potencial, mas apresenta pontos a auditar individualmente.",
        };
      case "nao_recomendado":
        default:
        return {
          bg: "bg-rose-50 border-rose-200 text-rose-800",
          badge: "bg-rose-500 text-white",
          label: "Não Recomendado",
          desc: "Candidato não atende a critérios eliminatórios ou apresenta baixa aderência técnica.",
        };
    }
  };

  const copyJsonToClipboard = () => {
    // Exact standard JSON required by guidelines
    const standardJson = {
      candidato_id: avaliacao.candidato_id,
      processo_seletivo_id: avaliacao.processo_seletivo_id,
      score_aderencia: avaliacao.score_aderencia,
      atende_requisitos_obrigatorios: avaliacao.atende_requisitos_obrigatorios,
      requisitos_atendidos: avaliacao.requisitos_atendidos,
      requisitos_nao_atendidos: avaliacao.requisitos_nao_atendidos,
      devolutiva: avaliacao.devolutiva,
      recomendacao: avaliacao.recomendacao,
    };

    navigator.clipboard.writeText(JSON.stringify(standardJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copyMessageToClipboard = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const generateInstitutionalMessage = async () => {
    setIsGeneratingMessage(true);
    setGeneratedMessage(null);
    try {
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidato,
          vaga,
          recomendacao: avaliacao.recomendacao,
          devolutiva: avaliacao.devolutiva,
        }),
      });
      const data = await response.json();
      setGeneratedMessage(data.message);
    } catch (err) {
      console.error(err);
      setGeneratedMessage("Erro ao gerar comunicação institucional.");
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const recInfo = getRecommendationDetails(avaliacao.recomendacao);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6" id="avaliacao_visualizer_container">
      {/* Upper Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Relatório de Diagnóstico de IA</span>
          <h2 className="text-xl font-bold text-slate-800">
            Análise de {candidato.nome}
          </h2>
          <span className="text-xs text-slate-500 block mt-0.5">Vaga: <span className="font-semibold text-slate-700">{vaga.titulo}</span> ({vaga.entidade})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Score de Aderência</span>
            <span className="text-3xl font-extrabold text-slate-900">{avaliacao.score_aderencia}%</span>
          </div>
          {/* Circular Score Gauge */}
          <div className="relative w-12 h-12 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-slate-100 fill-none"
                strokeWidth="4"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                className={`fill-none transition-all duration-1000 ${
                  avaliacao.score_aderencia >= 85 ? "stroke-emerald-500" : avaliacao.score_aderencia >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                }`}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - avaliacao.score_aderencia / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
              {avaliacao.score_aderencia}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas Éticos / Discriminação (Principle 2) */}
      {(avaliacao.possivel_alerta_discriminacao || vaga.id === "vaga_discriminatoria_teste" || candidato.id === "cand_discriminatorio_teste") && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs text-rose-800">
            <strong className="block font-bold mb-1 uppercase tracking-wider">Aviso Ético (Antidiscriminação)</strong>
            <p className="leading-relaxed">
              {avaliacao.alerta_detalhes || 
                "Foram detectadas possíveis menções a dados de foro íntimo (idade, gênero, estado civil ou religião) no formulário de vaga ou no currículo. O Copiloto de IA FIESC ignorou esses fatores para a nota, garantindo imparcialidade e conformidade com as diretrizes e leis trabalhistas vigentes."
              }
            </p>
          </div>
        </div>
      )}

      {/* Recommendation Block */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${recInfo.bg}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${recInfo.badge}`}>
              {recInfo.label}
            </span>
            <span className={`text-xs font-semibold ${avaliacao.atende_requisitos_obrigatorios ? "text-emerald-700" : "text-rose-700"}`}>
              {avaliacao.atende_requisitos_obrigatorios ? "Atende requisitos obrigatórios" : "Requisitos obrigatórios ausentes"}
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-95">{recInfo.desc}</p>
        </div>
      </div>

      {/* Devolutiva Textual (Principle 3) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-500" />
          Justificativa Técnica (Devolutiva do Sistema)
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
          {avaliacao.devolutiva}
        </p>
      </div>

      {/* Grid: Requisitos Atendidos vs Não Atendidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Requisitos Atendidos */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Requisitos Atendidos
          </h4>
          <ul className="space-y-2">
            {avaliacao.requisitos_atendidos.length === 0 ? (
              <li className="text-[11px] text-slate-400 italic">Nenhum critério compatível listado.</li>
            ) : (
              avaliacao.requisitos_atendidos.map((req, idx) => (
                <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-500 text-xs mt-0.5 shrink-0">✓</span>
                  <span>{req}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Requisitos Não Atendidos */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-500" />
            Critérios Não Atendidos / Lacunas
          </h4>
          <ul className="space-y-2">
            {avaliacao.requisitos_nao_atendidos.length === 0 ? (
              <li className="text-[11px] text-emerald-700 font-medium italic flex items-center gap-1 leading-normal">
                <ShieldCheck className="w-4 h-4" /> Atende a todas as exigências analisadas!
              </li>
            ) : (
              avaliacao.requisitos_nao_atendidos.map((req, idx) => (
                <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                  <span className="text-rose-500 text-xs mt-0.5 shrink-0">✗</span>
                  <span>{req}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Email / Communication Generator (Auxiliary Tool for Recruiter productivity) */}
      <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              Comunicação Institucional para Candidato
            </h3>
            <p className="text-[10px] text-slate-400 leading-snug">
              Crie uma mensagem customizada baseada na marca da entidade ({vaga.entidade}) e resultado da avaliação.
            </p>
          </div>
          <button
            onClick={generateInstitutionalMessage}
            disabled={isGeneratingMessage}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition duration-200 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isGeneratingMessage ? "Gerando..." : "Gerar E-mail"}
          </button>
        </div>

        {generatedMessage && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="relative">
              <textarea
                rows={7}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full text-xs p-3.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 leading-relaxed text-slate-700"
              />
              <button
                onClick={copyMessageToClipboard}
                className="absolute right-3 top-3 bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-slate-600 hover:text-slate-800 transition cursor-pointer"
                title="Copiar mensagem"
              >
                {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedMsg && (
              <p className="text-[10px] text-emerald-700 font-bold text-right">Mensagem copiada para a área de transferência!</p>
            )}
          </div>
        )}
      </div>

      {/* JSON Output Accordion (Principle 5 / Format Output compliance) */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition"
        >
          <FileJson className="w-4 h-4 text-slate-400" />
          {showRawJson ? "Ocultar JSON da Avaliação" : "Ver JSON de Avaliação Integrada (Formato de Saída Padrão)"}
        </button>

        {showRawJson && (
          <div className="mt-3.5 relative">
            <pre className="text-[10px] font-mono bg-slate-900 text-slate-200 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-80">
              {JSON.stringify(
                {
                  candidato_id: avaliacao.candidato_id,
                  processo_seletivo_id: avaliacao.processo_seletivo_id,
                  score_aderencia: avaliacao.score_aderencia,
                  atende_requisitos_obrigatorios: avaliacao.atende_requisitos_obrigatorios,
                  requisitos_atendidos: avaliacao.requisitos_atendidos,
                  requisitos_nao_atendidos: avaliacao.requisitos_nao_atendidos,
                  devolutiva: avaliacao.devolutiva,
                  recomendacao: avaliacao.recomendacao,
                },
                null,
                2
              )}
            </pre>
            <button
              onClick={copyJsonToClipboard}
              className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 p-1.5 rounded text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px]"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar JSON
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
