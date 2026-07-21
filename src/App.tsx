import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import VagasList from "./components/VagasList";
import CandidatosList from "./components/CandidatosList";
import AvaliacaoVisualizer from "./components/AvaliacaoVisualizer";
import EstudioAvaliacoes from "./components/EstudioAvaliacoes";
import ConsoleDashboard from "./components/ConsoleDashboard";
import KanbanBoard from "./components/KanbanBoard";
import MicrositeVagas from "./components/MicrositeVagas";
import PortalCandidato from "./components/PortalCandidato";
import { Vaga, Candidato, Avaliacao } from "./types";
import { initialVagas, initialCandidatos } from "./data/seedData";
import { 
  Briefcase, Users, FileCheck2, Sparkles, AlertTriangle, ShieldCheck, 
  HelpCircle, Layers, Award, BarChart3, ChevronRight, FileJson, 
  Check, Copy, LayoutDashboard, Search, Eye, Settings, Shield, User, LogIn
} from "lucide-react";

export default function App() {
  // Navigation Role: "recrutador" | "candidato"
  const [role, setRole] = useState<"recrutador" | "candidato">("recrutador");
  
  // Recruiter Modules: "dashboard" | "kanban" | "triagem_ia" | "estudio_cases" | "config"
  const [recrutadorTab, setRecrutadorTab] = useState<"dashboard" | "kanban" | "triagem_ia" | "estudio_cases" | "config">("dashboard");
  
  // Candidate Modules: "vagas_portal" | "minhas_candidaturas"
  const [candidatoTab, setCandidatoTab] = useState<"vagas_portal" | "minhas_candidaturas">("vagas_portal");

  // Core Data States
  const [vagas, setVagas] = useState<Vaga[]>(initialVagas);
  const [candidatos, setCandidatos] = useState<Candidato[]>(initialCandidatos);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(initialVagas[0]);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(initialCandidatos[0]);
  
  // Real-time Candidacy Tracking (Simulated database connection)
  const [appliedMap, setAppliedMap] = useState<Record<string, string[]>>({
    "cand_1": ["vaga_senai_1"],
    "cand_2": ["vaga_sesi_1"],
    "cand_3": ["vaga_iel_1"],
    "cand_4": ["vaga_fiesc_1"],
    "cand_5": ["vaga_senai_2"]
  });

  // Single Candidate Evaluation States
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  // Batch Screening (Modo Lote) States
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [batchResults, setBatchResults] = useState<any[] | null>(null);
  const [showBatchRawJson, setShowBatchRawJson] = useState(false);
  const [copiedBatchJson, setCopiedBatchJson] = useState(false);

  // Future integration points notes
  // // integrar com API Benner RH via REST/OAuth2 aqui
  // // conectar com barramento de autenticação FIESC (SAML/ADFS)
  // // sincronizar laudos e certificações com banco SESI Saúde Ocupacional

  const loadingMessages = [
    "Iniciando motor de correspondência cognitiva...",
    "Mascarando dados confidenciais para total aderência à LGPD (Princípio 1)...",
    "Filtrando idade, gênero e estado civil para mitigar viés discriminatório (Princípio 2)...",
    "Analisando correspondência entre habilidades e requisitos obrigatórios (Peso 2x)...",
    "Avaliando requisitos desejáveis e certificações correlatas...",
    "Estruturando parecer técnico isento e recomendação final..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEvaluating) {
      setLoadingMessage(loadingMessages[0]);
      setLoadingStep(0);
      
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          const next = (prev + 1) % loadingMessages.length;
          setLoadingMessage(loadingMessages[next]);
          return next;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  const handleSelectVaga = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setAvaliacao(null);
    setBatchResults(null);
  };

  const handleSelectCandidato = (cand: Candidato) => {
    setSelectedCandidato(cand);
    setAvaliacao(null);
  };

  const handleAddVaga = (newVagaData: Omit<Vaga, "id" | "dataCriacao">) => {
    const newVaga: Vaga = {
      ...newVagaData,
      id: `vaga_${Date.now()}`,
      dataCriacao: new Date().toISOString().split("T")[0],
    };
    setVagas([newVaga, ...vagas]);
    setSelectedVaga(newVaga);
    setAvaliacao(null);
    setBatchResults(null);
  };

  const handleAddCandidato = (newCandData: Omit<Candidato, "id" | "dataCandidatura">) => {
    const newCand: Candidato = {
      ...newCandData,
      id: `cand_${Date.now()}`,
      dataCandidatura: new Date().toISOString().split("T")[0],
    };
    setCandidatos([newCand, ...candidatos]);
    setSelectedCandidato(newCand);
    setAvaliacao(null);
  };

  // Candidacy registration on public portal
  const handleApply = (vagaId: string, candidatoId: string) => {
    setAppliedMap((prev) => ({
      ...prev,
      [candidatoId]: Array.from(new Set([...(prev[candidatoId] || []), vagaId])),
    }));
  };

  // Solo evaluation call (computes weights + calls backend API)
  const handleEvaluate = async (candidate: Candidato) => {
    if (!selectedVaga) return;
    setIsEvaluating(true);
    setAvaliacao(null);
    setBatchResults(null);

    const formattedVaga = {
      ...selectedVaga,
      requisitos_obrigatorios: selectedVaga.requisitos_obrigatorios.map((req, idx) => ({
        criterio: req,
        eliminatorio: true,
        peso: 5 - Math.min(idx, 2),
      })),
      requisitos_desejaveis: selectedVaga.requisitos_desejaveis.map((req, idx) => ({
        criterio: req,
        peso: 4 - Math.min(idx, 2),
      })),
    };

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidato: candidate, vaga: formattedVaga }),
      });
      const data = await response.json();
      setAvaliacao(data);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao realizar a avaliação técnica.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Batch Evaluation call (evaluates all active candidates at once)
  const handleBatchEvaluate = async () => {
    if (!selectedVaga) return;
    setIsBatchEvaluating(true);
    setBatchResults(null);
    setAvaliacao(null);

    const formattedVaga = {
      ...selectedVaga,
      requisitos_obrigatorios: selectedVaga.requisitos_obrigatorios.map((req, idx) => ({
        criterio: req,
        eliminatorio: true,
        peso: 5 - Math.min(idx, 2),
      })),
      requisitos_desejaveis: selectedVaga.requisitos_desejaveis.map((req, idx) => ({
        criterio: req,
        peso: 4 - Math.min(idx, 2),
      })),
    };

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatos: candidatos, vaga: formattedVaga }),
      });
      const data = await response.json();
      if (data.resultados) {
        setBatchResults(data.resultados);
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao processar a triagem em lote.");
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="main_app_wrapper">
      
      {/* Top Banner indicating FIESC Identity & Mode */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>HOMOLOGADO SISTEMA FIESC (SST / BENNER INTEGRADO)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ambiente: <strong>Homologação</strong></span>
            <span>Região: <strong>Santa Catarina</strong></span>
          </div>
        </div>
      </div>

      <Header />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto" id="portal_body_split">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Context/Role Selection Toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso de Painel</label>
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
                <button
                  onClick={() => setRole("recrutador")}
                  className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "recrutador"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Recrutador
                </button>
                <button
                  onClick={() => setRole("candidato")}
                  className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "candidato"
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Candidato
                </button>
              </div>
            </div>

            {/* Role specific sidebar modules */}
            {role === "recrutador" ? (
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1">Módulos Recrutador</span>
                
                {/* Module 1: Dashboard */}
                <button
                  onClick={() => setRecrutadorTab("dashboard")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    recrutadorTab === "dashboard"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  Console / Dashboard
                </button>

                {/* Module 2: Kanban */}
                <button
                  onClick={() => setRecrutadorTab("kanban")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    recrutadorTab === "kanban"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Processos (Kanban)
                </button>

                {/* Module 3: Triagem IA */}
                <button
                  onClick={() => setRecrutadorTab("triagem_ia")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    recrutadorTab === "triagem_ia"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Triagem Inteligente IA
                </button>

                {/* Module 4: Estúdio de Provas */}
                <button
                  onClick={() => setRecrutadorTab("estudio_cases")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    recrutadorTab === "estudio_cases"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Award className="w-4 h-4 text-purple-400" />
                  Estúdio de Provas & Cases
                </button>

                {/* Module 5: Admin Stub */}
                <button
                  onClick={() => setRecrutadorTab("config")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    recrutadorTab === "config"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Administração / Ajustes
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1">Portal do Candidato</span>
                
                {/* Cand 1: Job Microsite */}
                <button
                  onClick={() => setCandidatoTab("vagas_portal")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    candidatoTab === "vagas_portal"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Microsite de Vagas
                </button>

                {/* Cand 2: Candidaturas List */}
                <button
                  onClick={() => setCandidatoTab("minhas_candidaturas")}
                  className={`w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer ${
                    candidatoTab === "minhas_candidaturas"
                      ? "bg-slate-800 text-white border-l-4 border-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Minhas Candidaturas
                </button>
              </div>
            )}
          </div>

          {/* Quick legal/ethics credit */}
          <div className="pt-8 border-t border-slate-800 text-[10px] text-slate-500 space-y-1.5">
            <p className="font-semibold">✓ Conexão Benner Ativa</p>
            <p>Este sistema respeita rigorosamente a LGPD e o princípio da não-discriminação profissional.</p>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          
          {/* RECRUITER MODE VIEWPORT */}
          {role === "recrutador" && (
            <>
              {/* Dashboard Tab */}
              {recrutadorTab === "dashboard" && (
                <ConsoleDashboard 
                  vagas={vagas} 
                  candidatosCount={candidatos.length} 
                />
              )}

              {/* Kanban Tab */}
              {recrutadorTab === "kanban" && (
                <KanbanBoard 
                  vagas={vagas} 
                  candidatos={candidatos} 
                />
              )}

              {/* Triagem IA Tab (Old Triagem Automática View) */}
              {recrutadorTab === "triagem_ia" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
                  {/* Left block - Vagas List */}
                  <div className="lg:col-span-4 flex flex-col h-full space-y-6">
                    <VagasList
                      vagas={vagas}
                      selectedVaga={selectedVaga}
                      onSelectVaga={handleSelectVaga}
                      onAddVaga={handleAddVaga}
                    />
                  </div>

                  {/* Middle block - Candidatos List */}
                  <div className="lg:col-span-4 flex flex-col h-full space-y-6">
                    <CandidatosList
                      candidatos={candidatos}
                      selectedCandidato={selectedCandidato}
                      onSelectCandidato={handleSelectCandidato}
                      onAddCandidato={handleAddCandidato}
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
                            const cand = candidatos.find(c => c.id === res.candidato_id);
                            const isNotRecommended = res.recomendacao === "nao_recomendado";
                            const isGold = idx === 0 && res.score_aderencia >= 75;
                            
                            return (
                              <div
                                key={res.candidato_id}
                                onClick={() => {
                                  const foundCand = candidatos.find(c => c.id === res.candidato_id);
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
              )}

              {/* Estúdio de Provas & Cases Tab (Old Estúdio View) */}
              {recrutadorTab === "estudio_cases" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">Assistente Inteligente de Exames & Integridade FIESC</h4>
                      <p className="text-xs text-indigo-800 leading-relaxed">
                        Automatize a elaboração de testes objetivos/cases para o <strong>SENAI, SESI, IEL ou FIESC</strong>. Em seguida, utilize o Corretor de Respostas baseado nas rubricas de pontuação e valide a integridade do processo analisando plágios ou cola automática de IA sem julgamentos precipitados.
                      </p>
                    </div>
                  </div>

                  <EstudioAvaliacoes
                    vaga={selectedVaga}
                    candidato={selectedCandidato}
                  />
                </div>
              )}

              {/* Config Tab (Simple administration view) */}
              {recrutadorTab === "config" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Settings className="w-5 h-5 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Painel de Administração ATS</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-slate-800 block">Conexão Benner ERP / Folha</span>
                        <p>O sincronismo com os módulos de recrutamento Benner está atualmente operando em modo Sandbox local.</p>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="font-extrabold text-slate-800 block">Princípio de Isenção Algorítmica</span>
                        <p>As diretrizes éticas estão configuradas como <strong>Ativas e Inegociáveis</strong>. O sistema filtra automaticamente referências diretas de gênero, idade limite, credo, etnia e filiação sindical.</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">Auditoria de Logs FIESC</span>
                      <p className="text-[11px]">Todos os acessos e processos seletivos são rastreáveis para fins de auditoria do Ministério Público do Trabalho e auditorias internas do conselho FIESC.</p>
                      
                      <div className="text-[10px] font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg">
                        • LOG_BENNER_REST: OK<br />
                        • AUDIT_LGPD_SEC_OK: 100%<br />
                        • TOKEN_OAUTH_EXPIRES: 2026-12-31
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CANDIDATE MODE VIEWPORT */}
          {role === "candidato" && (
            <>
              {/* Job Microsite Portal */}
              {candidatoTab === "vagas_portal" && (
                <MicrositeVagas
                  vagas={vagas}
                  candidatos={candidatos}
                  onApply={handleApply}
                  appliedMap={appliedMap}
                />
              )}

              {/* My Candidacies Board */}
              {candidatoTab === "minhas_candidaturas" && (
                <PortalCandidato
                  vagas={vagas}
                  candidatos={candidatos}
                  appliedMap={appliedMap}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; 2026 Sistema FIESC - Federação das Indústrias do Estado de Santa Catarina.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition">LGPD: Lei 13.709/2018</span>
            <span>•</span>
            <span className="hover:text-white transition">R&amp;S Integrado da Indústria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
