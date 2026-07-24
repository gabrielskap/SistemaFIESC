import { useState, useEffect } from "react";
import {
  Sparkles, Layers, BarChart3, HelpCircle, ChevronRight, Check, Copy, FileCheck2, AlertTriangle,
} from "lucide-react";
import VagasList from "../components/VagasList";
import CandidatosList from "../components/CandidatosList";
import AvaliacaoVisualizer from "../components/AvaliacaoVisualizer";
import { Vaga, Candidato, Avaliacao } from "../types";
import { usePortal } from "../portal/portalContext";
import { apiFetch } from "../lib/apiFetch";

const loadingMessages = [
  "Iniciando motor de correspondência cognitiva...",
  "Mascarando dados confidenciais para total aderência à LGPD (Princípio 1)...",
  "Filtrando idade, gênero e estado civil para mitigar viés discriminatório (Princípio 2)...",
  "Analisando correspondência entre habilidades e requisitos obrigatórios (Peso 2x)...",
  "Avaliando requisitos desejáveis e certificações correlatas...",
  "Estruturando parecer técnico isento e recomendação final...",
];

/** Expands a vaga's requirement lists into weighted criteria for the API. */
const formatVagaForApi = (vaga: Vaga) => ({
  ...vaga,
  requisitos_obrigatorios: vaga.requisitos_obrigatorios.map((req, idx) => ({
    criterio: req,
    // Só o 1º obrigatório é eliminatório por padrão (evita que um único
    // falso-negativo do matching rebaixe todo mundo para "não recomendado").
    eliminatorio: idx === 0,
    peso: 5 - Math.min(idx, 2),
  })),
  requisitos_desejaveis: vaga.requisitos_desejaveis.map((req, idx) => ({
    criterio: req,
    peso: 4 - Math.min(idx, 2),
  })),
});

export default function TriagemPage() {
  const {
    vagas, candidatos, selectedVaga, selectedCandidato,
    setSelectedCandidato, handleSelectVaga, handleSelectCandidato,
    handleAddVaga, handleAddCandidato,
  } = usePortal();

  // Single evaluation state
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Batch screening state
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [showBatchRawJson, setShowBatchRawJson] = useState(false);
  const [copiedBatchJson, setCopiedBatchJson] = useState(false);

  // Erro de API exibido inline (substitui os alert() anteriores).
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEvaluating) {
      setLoadingMessage(loadingMessages[0]);
      let step = 0;
      interval = setInterval(() => {
        step = (step + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[step]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  // Selecting/adding a vaga or candidato clears any stale evaluation output.
  const onSelectVaga = (vaga: Vaga) => {
    handleSelectVaga(vaga);
    setAvaliacao(null);
    setBatchResults(null);
  };
  const onAddVaga = (data: Omit<Vaga, "id" | "dataCriacao">) => {
    handleAddVaga(data);
    setAvaliacao(null);
    setBatchResults(null);
  };
  const onSelectCandidato = (candidato: Candidato) => {
    handleSelectCandidato(candidato);
    setAvaliacao(null);
  };
  const onAddCandidato = (data: Omit<Candidato, "id" | "dataCandidatura">) => {
    handleAddCandidato(data);
    setAvaliacao(null);
  };

  const handleEvaluate = async (candidate: Candidato) => {
    if (!selectedVaga) return;
    setIsEvaluating(true);
    setAvaliacao(null);
    setBatchResults(null);
    setError(null);
    try {
      const response = await apiFetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidato: candidate, vaga: formatVagaForApi(selectedVaga) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAvaliacao(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível concluir a avaliação técnica. Verifique sua sessão e tente novamente.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleBatchEvaluate = async () => {
    if (!selectedVaga) return;
    setIsBatchEvaluating(true);
    setBatchResults(null);
    setAvaliacao(null);
    setError(null);
    try {
      const response = await apiFetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatos: candidatos, vaga: formatVagaForApi(selectedVaga) }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.resultados) {
        setBatchResults(data.resultados);
      }
    } catch (err) {
      console.error(err);
      setError("Não foi possível processar a triagem em lote. Verifique sua sessão e tente novamente.");
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const copyBatchJsonToClipboard = () => {
    if (!batchResults) return;
    navigator.clipboard.writeText(JSON.stringify(batchResults, null, 2));
    setCopiedBatchJson(true);
    setTimeout(() => setCopiedBatchJson(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      {/* Left block - Vagas List */}
      <div className="lg:col-span-4 flex flex-col h-full space-y-6">
        <VagasList
          vagas={vagas}
          selectedVaga={selectedVaga}
          onSelectVaga={onSelectVaga}
          onAddVaga={onAddVaga}
        />
      </div>

      {/* Middle block - Candidatos List */}
      <div className="lg:col-span-4 flex flex-col h-full space-y-6">
        <CandidatosList
          candidatos={candidatos}
          selectedCandidato={selectedCandidato}
          onSelectCandidato={onSelectCandidato}
          onAddCandidato={onAddCandidato}
          onEvaluate={handleEvaluate}
          isEvaluating={isEvaluating}
        />

        {/* Batch Triagem Block */}
        {selectedVaga && (
          <div className="bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Triagem Multicritério</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Execute a triagem comparativa de <strong>TODOS os candidatos ({candidatos.length})</strong> simultaneamente contra a vaga <strong>&ldquo;{selectedVaga.titulo}&rdquo;</strong> usando ponderação exata de pesos.
            </p>
            <button
              onClick={handleBatchEvaluate}
              disabled={isBatchEvaluating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              {isBatchEvaluating ? "Calculando Rankings em Lote..." : "Executar Triagem em Lote (Modo Lote)"}
            </button>
          </div>
        )}
      </div>

      {/* Right block - Outputs of AI Evaluation */}
      <div className="lg:col-span-4 flex flex-col justify-start h-full">
        {error && (
          <div className="mb-4 flex items-start gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {isEvaluating ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 animate-spin border-t-slate-800" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Processando Inteligência...</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-xs mx-auto">
                <p className="text-xs text-slate-600 italic font-medium">
                  &ldquo;{loadingMessage}&rdquo;
                </p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 max-w-xs">
              A decisão final é humana. Nossa IA apenas consolida critérios técnicos em conformidade absoluta com as políticas do Sistema FIESC.
            </p>
          </div>
        ) : batchResults ? (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider block">Ranqueamento de Desempenho</span>
                <h3 className="text-sm font-bold text-slate-800">Resultado do Modo Lote ({batchResults.length} Perfis)</h3>
              </div>
              <button
                onClick={() => setShowBatchRawJson(!showBatchRawJson)}
                className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold underline flex items-center gap-0.5"
              >
                {showBatchRawJson ? "Ocultar JSON" : "Ver JSON Lote"}
              </button>
            </div>

            {showBatchRawJson && (
              <div className="relative bg-slate-900 rounded-lg p-3 border border-slate-800">
                <pre className="text-[9px] font-mono text-slate-300 max-h-40 overflow-y-auto leading-normal">
                  {JSON.stringify(batchResults, null, 2)}
                </pre>
                <button
                  onClick={copyBatchJsonToClipboard}
                  className="absolute right-2 top-2 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1"
                >
                  {copiedBatchJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[9px] text-slate-500 leading-relaxed flex items-start gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Regra de Cálculo FIESC:</strong> score = média ponderada. Requisitos obrigatórios têm <strong>peso 2x</strong> no cálculo final. Requisitos obrigatórios não atendidos rebaixam a recomendação para <strong>&ldquo;não recomendado&rdquo;</strong> independente do score obtido.
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {batchResults.map((res, idx) => {
                const cand = candidatos.find((c) => c.id === res.candidato_id);
                const isNotRecommended = res.recomendacao === "nao_recomendado";
                const isGold = idx === 0 && res.score_aderencia >= 75;

                return (
                  <div
                    key={res.candidato_id}
                    onClick={() => {
                      const foundCand = candidatos.find((c) => c.id === res.candidato_id);
                      if (foundCand) {
                        setSelectedCandidato(foundCand);
                        setAvaliacao(res);
                        setBatchResults(null);
                      }
                    }}
                    className={`p-3 rounded-lg border transition cursor-pointer hover:shadow-sm ${
                      isGold
                        ? "bg-amber-50/50 border-amber-200"
                        : isNotRecommended
                          ? "bg-rose-50/20 border-slate-200 opacity-75 hover:opacity-100"
                          : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-slate-800 truncate max-w-[150px]">
                        {cand?.nome || "Candidato"}
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        res.score_aderencia >= 75 ? "bg-emerald-100 text-emerald-800" : res.score_aderencia >= 45 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {res.score_aderencia}%
                      </span>
                    </div>

                    <p className="text-[9px] text-slate-500 line-clamp-2 leading-normal mb-1.5">
                      {res.devolutiva}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                        res.recomendacao === "avancar" ? "bg-emerald-500 text-white" : res.recomendacao === "revisar_manual" ? "bg-amber-500 text-white" : "bg-slate-400 text-white"
                      }`}>
                        {res.recomendacao === "avancar" ? "Avançar" : res.recomendacao === "revisar_manual" ? "Revisar" : "Não Recomendado"}
                      </span>
                      <span className="text-[8px] text-indigo-500 font-bold flex items-center gap-0.5 hover:underline">
                        Ver Detalhes <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : avaliacao && selectedCandidato && selectedVaga ? (
          <AvaliacaoVisualizer
            avaliacao={avaliacao}
            candidato={selectedCandidato}
            vaga={selectedVaga}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-5 h-full min-h-[400px]">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Estúdio de Avaliação Técnica</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selecione uma vaga no menu lateral esquerdo e depois escolha um candidato na coluna central para disparar a triagem automática.
              </p>
            </div>

            {/* Demonstration Guide */}
            <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-4 text-left max-w-sm space-y-2.5">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Guia de Demonstração Ética:
              </span>
              <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1.5 leading-snug">
                <li>
                  Selecione a <strong>Vaga Teste de Auditoria de Discriminação</strong> (criada com requisitos ilegais de gênero e idade limite).
                </li>
                <li>
                  Clique em <strong>Auditar Vaga</strong> no rodapé do card da vaga para ver a IA identificando o viés.
                </li>
                <li>
                  Ou selecione o <strong>Candidato Teste de Discriminação</strong> (que incluiu estado civil, religião e idade) e clique em avaliar. Veja o Copiloto realizar uma avaliação isenta e justa, ignorando as informações proibidas!
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
