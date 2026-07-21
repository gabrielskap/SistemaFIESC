import React, { useState } from "react";
import { Vaga, Candidato } from "../types";
import { Search, MapPin, Briefcase, FileCheck, Check, Sparkles, Building, ChevronRight, UserPlus } from "lucide-react";

interface MicrositeVagasProps {
  vagas: Vaga[];
  candidatos: Candidato[];
  onApply: (vagaId: string, candidatoId: string) => void;
  appliedMap: Record<string, string[]>; // candidateId -> vagaId[]
}

export default function MicrositeVagas({ vagas, candidatos, onApply, appliedMap }: MicrositeVagasProps) {
  const [selectedEntidade, setSelectedEntidade] = useState<string>("TODAS");
  const [selectedRegional, setSelectedRegional] = useState<string>("TODAS");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyOpen, setOnlyOpen] = useState<boolean>(true);

  // Application Modal States
  const [applyingVaga, setApplyingVaga] = useState<Vaga | null>(null);
  const [selectedSimulatedCand, setSelectedSimulatedCand] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Style helper for entities
  const getEntityStyle = (entidade: string) => {
    switch (entidade) {
      case "SESI":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SENAI":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "IEL":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "FIESC":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Extract unique regions
  const regionaisList = ["TODAS", ...Array.from(new Set(vagas.map((v) => v.regional)))];

  // Filters logic
  const filteredVagas = vagas.filter((v) => {
    const matchesEntidade = selectedEntidade === "TODAS" || v.entidade === selectedEntidade;
    const matchesRegional = selectedRegional === "TODAS" || v.regional === selectedRegional;
    const matchesSearch = v.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = !onlyOpen || v.status === "Aberta" || v.status === "Em Seleção";
    return matchesEntidade && matchesRegional && matchesSearch && matchesOpen;
  });

  const handleOpenApplyModal = (vaga: Vaga) => {
    setApplyingVaga(vaga);
    // default to first non-applied candidate for nicer UX
    const firstEligible = candidatos.find(c => !(appliedMap[c.id]?.includes(vaga.id)))?.id || candidatos[0]?.id || "";
    setSelectedSimulatedCand(firstEligible);
    setSuccessMessage("");
  };

  const handleConfirmApplication = () => {
    if (!applyingVaga || !selectedSimulatedCand) return;
    
    onApply(applyingVaga.id, selectedSimulatedCand);
    const candidateName = candidatos.find(c => c.id === selectedSimulatedCand)?.nome || "Candidato";
    
    setSuccessMessage(`Inscrição de ${candidateName} enviada com sucesso para a vaga "${applyingVaga.titulo}"!`);
    
    setTimeout(() => {
      setApplyingVaga(null);
      setSuccessMessage("");
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="microsite_vagas_view">
      
      {/* Institutional Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl p-6 md:p-10 shadow-xl border border-slate-800/60 relative overflow-hidden">
        {/* Decorative ambient background spots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-600/5 rounded-full blur-3xl" />

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Trabalhe Conosco - Sistema FIESC
          </div>
          <h1 className="text-2xl md:text-4xl font-sans font-black tracking-tight leading-tight">
            Impulsione o futuro da <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Indústria Catarinense</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Seja no SESI cuidando da saúde ocupacional, no SENAI liderando a educação tecnológica profissional, no IEL fomentando novos talentos, ou na FIESC coordenando o fomento industrial — sua carreira transforma Santa Catarina.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold uppercase tracking-wider pt-2">
            <span>✓ Inscrições Gratuitas</span>
            <span>•</span>
            <span>✓ Provas Éticas Autogeradas</span>
            <span>•</span>
            <span>✓ Total Transparência</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Filtrar Oportunidades</span>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Term */}
          <div className="md:col-span-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o cargo, tecnologia ou palavra-chave..."
              className="w-full text-xs pl-8.5 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Regional */}
          <div>
            <select
              value={selectedRegional}
              onChange={(e) => setSelectedRegional(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600 capitalize"
            >
              <option value="TODAS">Qualquer Regional (SC)</option>
              {regionaisList.filter(r => r !== "TODAS").map((reg) => (
                <option key={reg} value={reg}>
                  Regional {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Entity */}
          <div>
            <select
              value={selectedEntidade}
              onChange={(e) => setSelectedEntidade(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600"
            >
              <option value="TODAS">Qualquer Entidade (FIESC)</option>
              <option value="FIESC">FIESC</option>
              <option value="SESI">SESI</option>
              <option value="SENAI">SENAI</option>
              <option value="IEL">IEL</option>
            </select>
          </div>
        </div>

        {/* Checkbox */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="onlyOpenCheck"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="onlyOpenCheck" className="text-slate-600 cursor-pointer select-none font-semibold">
              Ocultar vagas com inscrições encerradas
            </label>
          </div>

          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Exibindo {filteredVagas.length} de {vagas.length} vagas
          </span>
        </div>
      </div>

      {/* Grid of Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVagas.length > 0 ? (
          filteredVagas.map((v) => {
            const isClosing = v.status === "Em Seleção";
            return (
              <div
                key={v.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div className="space-y-3.5">
                  {/* Entity and location */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${getEntityStyle(v.entidade)}`}>
                      {v.entidade}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 capitalize">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {v.regional}, SC
                    </span>
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                      {v.titulo}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>CLT • Integral</span>
                      <span>•</span>
                      <span className="font-mono text-[9px]">{v.dataCriacao}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                    {v.descricao}
                  </p>

                  {/* Requirements Preview */}
                  <div className="space-y-1 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Critério Obrigatório Chave</span>
                    <span className="text-[10px] text-slate-700 font-medium line-clamp-1">
                      • {v.requisitos_obrigatorios[0]}
                    </span>
                  </div>
                </div>

                {/* Application Actions */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase ${
                    isClosing ? "text-amber-600" : "text-emerald-600"
                  }`}>
                    {v.status}
                  </span>

                  <button
                    onClick={() => handleOpenApplyModal(v)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3.5 rounded-lg transition duration-200 cursor-pointer flex items-center gap-1 group-hover:translate-x-0.5"
                  >
                    Candidatar-se
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Nenhuma oportunidade ativa atende aos critérios de busca selecionados.
          </div>
        )}
      </div>

      {/* Application Simulation Modal */}
      {applyingVaga && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Simular Candidatura</h3>
              </div>
              <button
                onClick={() => setApplyingVaga(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {successMessage ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 py-8">
                <Check className="w-8 h-8 text-emerald-500 animate-bounce" />
                <p className="font-bold">{successMessage}</p>
                <p className="text-[10px] text-slate-500 pt-1">Verifique seu progresso no "Portal do Candidato"!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">VAGA SELECIONADA</span>
                  <p className="font-extrabold text-slate-900">{applyingVaga.titulo}</p>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Entidade: <strong>{applyingVaga.entidade}</strong></span>
                    <span>Regional: <strong>{applyingVaga.regional}</strong></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Escolha um Perfil para Simular
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Selecione um dos candidatos simulados da nossa base para disparar a candidatura.
                  </p>
                  <select
                    value={selectedSimulatedCand}
                    onChange={(e) => setSelectedSimulatedCand(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600"
                  >
                    {candidatos.map((c) => {
                      const isApplied = appliedMap[c.id]?.includes(applyingVaga.id);
                      return (
                        <option key={c.id} value={c.id} disabled={isApplied}>
                          {c.nome} {isApplied ? "(Já Inscrito)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={handleConfirmApplication}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-200" />
                  Confirmar Inscrição Online
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
