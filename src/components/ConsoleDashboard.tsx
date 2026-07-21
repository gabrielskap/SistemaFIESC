import React, { useState } from "react";
import { Vaga } from "../types";
import { Briefcase, Users, Clock, CheckCircle2, Search, Filter, RefreshCw, BarChart3, Building } from "lucide-react";

interface ConsoleDashboardProps {
  vagas: Vaga[];
  candidatosCount: number;
}

export default function ConsoleDashboard({ vagas, candidatosCount }: ConsoleDashboardProps) {
  const [selectedEntidade, setSelectedEntidade] = useState<string>("TODAS");
  const [selectedRegional, setSelectedRegional] = useState<string>("TODAS");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // FIESC Entities helper for colors
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

  // Extract unique regionals
  const regionaisList = ["TODAS", ...Array.from(new Set(vagas.map((v) => v.regional)))];

  // Filtered jobs table data
  const filteredVagas = vagas.filter((v) => {
    const matchesEntidade = selectedEntidade === "TODAS" || v.entidade === selectedEntidade;
    const matchesRegional = selectedRegional === "TODAS" || v.regional === selectedRegional;
    const matchesSearch = v.titulo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEntidade && matchesRegional && matchesSearch;
  });

  // Funnel data
  const funnelData = [
    { etapa: "Inscritos (Atração)", count: 120, pct: 100, color: "bg-blue-600" },
    { etapa: "Triagem por Competências", count: 85, pct: 71, color: "bg-indigo-600" },
    { etapa: "Testes & Cases Técnicos", count: 42, pct: 35, color: "bg-purple-600" },
    { etapa: "Entrevistas Técnicas", count: 18, pct: 15, color: "bg-pink-600" },
    { etapa: "Homologados/Aprovados", count: 6, pct: 5, color: "bg-emerald-600" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="console_dashboard_view">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Vagas Publicadas</span>
            <span className="text-2xl font-extrabold text-slate-950">{vagas.length}</span>
            <span className="text-[10px] text-slate-500 font-medium block">Distribuídas regionalmente</span>
          </div>
          <div className="bg-blue-50 text-blue-700 p-3.5 rounded-xl border border-blue-100">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Banco de Talentos</span>
            <span className="text-2xl font-extrabold text-slate-950">{candidatosCount}</span>
            <span className="text-[10px] text-slate-500 font-medium block">Ativos em Santa Catarina</span>
          </div>
          <div className="bg-indigo-50 text-indigo-700 p-3.5 rounded-xl border border-indigo-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tempo de Contratação</span>
            <span className="text-2xl font-extrabold text-slate-950">18 dias</span>
            <span className="text-[10px] text-emerald-600 font-bold block">↓ 4 dias vs meta Benner</span>
          </div>
          <div className="bg-amber-50 text-amber-700 p-3.5 rounded-xl border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Taxa de Efetividade</span>
            <span className="text-2xl font-extrabold text-slate-950">94.2%</span>
            <span className="text-[10px] text-slate-500 font-medium block">Sem interposição de recursos</span>
          </div>
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Funnel Chart and Processes Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Funnel Conversion Panel */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Funil de Conversão ATS</h3>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed mb-4">
              Visão consolidada de conversão por etapa técnica no Sistema FIESC.
              {/* integrar com API Benner RH via REST/OAuth2 aqui */}
            </div>

            <div className="space-y-4">
              {funnelData.map((stage) => (
                <div key={stage.etapa} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{stage.etapa}</span>
                    <span className="font-mono text-slate-500">
                      <strong>{stage.count}</strong> cands ({stage.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-6 rounded-lg overflow-hidden flex">
                    <div
                      className={`${stage.color} h-full text-white text-[9px] font-bold flex items-center pl-2 transition-all duration-500`}
                      style={{ width: `${stage.pct}%` }}
                    >
                      {stage.pct >= 15 ? `${stage.pct}%` : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[10px] text-slate-400">
            * Dados de fomento integrados à Federação das Indústrias do Estado de Santa Catarina.
          </div>
        </div>

        {/* Active Selection Processes Table */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Processos Seletivos Ativos</h3>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 px-2.5 py-1 rounded-full text-slate-500">
              {filteredVagas.length} Processos encontrados
            </span>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Filter 1: Entity */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Entidade</label>
              <select
                value={selectedEntidade}
                onChange={(e) => setSelectedEntidade(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600"
              >
                <option value="TODAS">Todas as Entidades</option>
                <option value="FIESC">FIESC</option>
                <option value="SESI">SESI</option>
                <option value="SENAI">SENAI</option>
                <option value="IEL">IEL</option>
              </select>
            </div>

            {/* Filter 2: Regional */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Regional</label>
              <select
                value={selectedRegional}
                onChange={(e) => setSelectedRegional(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600 capitalize"
              >
                {regionaisList.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg === "TODAS" ? "Todas as Regionais" : reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Search */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Busca de Vagas</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cargo..."
                  className="w-full text-xs pl-8 pr-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-slate-50/30">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Processo / Cargo</th>
                  <th className="px-4 py-3 text-center">Entidade</th>
                  <th className="px-4 py-3">Regional</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Data de Abertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVagas.length > 0 ? (
                  filteredVagas.map((v) => (
                    <tr key={v.id} className="hover:bg-white transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {v.titulo}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getEntityStyle(v.entidade)}`}>
                          {v.entidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {v.regional}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === "Aberta" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${v.status === "Aberta" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">
                        {v.dataCriacao}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      Nenhum processo seletivo ativo encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
