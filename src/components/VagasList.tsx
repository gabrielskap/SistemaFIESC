import React, { useState } from "react";
import { Vaga, Entidade } from "../types";
import { Search, Plus, Sparkles, AlertTriangle, CheckCircle, ShieldAlert, X, HelpCircle } from "lucide-react";

interface VagasListProps {
  vagas: Vaga[];
  selectedVaga: Vaga | null;
  onSelectVaga: (vaga: Vaga) => void;
  onAddVaga: (vaga: Omit<Vaga, "id" | "dataCriacao">) => void;
}

export default function VagasList({ vagas, selectedVaga, onSelectVaga, onAddVaga }: VagasListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntidadeFilter, setSelectedEntidadeFilter] = useState<string>("TODAS");
  const [showAddForm, setShowAddForm] = useState(false);
  const [auditingVagaId, setAuditingVagaId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<{
    seguro: boolean;
    alertas: string[];
    sugestoes: string[];
  } | null>(null);

  // Form State
  const [newTitulo, setNewTitulo] = useState("");
  const [newEntidade, setNewEntidade] = useState<Entidade>("SENAI");
  const [newRegional, setNewRegional] = useState("Joinville");
  const [newDescricao, setNewDescricao] = useState("");
  const [newObrigatorios, setNewObrigatorios] = useState("");
  const [newDesejaveis, setNewDesejaveis] = useState("");

  const regionals = ["Joinville", "Florianópolis", "Blumenau", "Chapecó", "Criciúma", "Lages", "Itajaí"];

  const filteredVagas = vagas.filter((vaga) => {
    const matchesSearch = vaga.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaga.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntidade = selectedEntidadeFilter === "TODAS" || vaga.entidade === selectedEntidadeFilter;
    return matchesSearch && matchesEntidade;
  });

  const getEntityStyle = (entidade: Entidade) => {
    switch (entidade) {
      case "SENAI":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          badge: "bg-red-100 text-red-800",
          borderSelected: "border-red-500 ring-2 ring-red-100",
          color: "text-red-600",
          accentBg: "bg-red-600",
          accentText: "text-red-500",
        };
      case "SESI":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          badge: "bg-blue-100 text-blue-800",
          borderSelected: "border-blue-500 ring-2 ring-blue-100",
          color: "text-blue-600",
          accentBg: "bg-blue-600",
          accentText: "text-blue-500",
        };
      case "IEL":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          badge: "bg-amber-100 text-amber-900",
          borderSelected: "border-amber-500 ring-2 ring-amber-100",
          color: "text-amber-600",
          accentBg: "bg-amber-500",
          accentText: "text-amber-500",
        };
      case "FIESC":
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          badge: "bg-slate-200 text-slate-800",
          borderSelected: "border-slate-800 ring-2 ring-slate-100",
          color: "text-slate-800",
          accentBg: "bg-slate-800",
          accentText: "text-slate-800",
        };
    }
  };

  const getEntitySpecialty = (entidade: Entidade) => {
    switch (entidade) {
      case "SENAI":
        return "Educação profissional, docente e inovação tecnológica.";
      case "SESI":
        return "Saúde ocupacional, segurança do trabalho e educação básica.";
      case "IEL":
        return "Estágio, Jovem Aprendiz e desenvolvimento de carreira.";
      case "FIESC":
        return "Representação de mercado e rotinas institucionais da indústria.";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo || !newDescricao) return;

    onAddVaga({
      titulo: newTitulo,
      entidade: newEntidade,
      regional: newRegional,
      descricao: newDescricao,
      requisitos_obrigatorios: newObrigatorios
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r !== ""),
      requisitos_desejaveis: newDesejaveis
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r !== ""),
      status: "Aberta",
    });

    // Reset
    setNewTitulo("");
    setNewDescricao("");
    setNewObrigatorios("");
    setNewDesejaveis("");
    setShowAddForm(false);
  };

  const loadDiscriminatoryTemplate = () => {
    setNewTitulo("Auxiliar Administrativo e Recepção");
    setNewEntidade("FIESC");
    setNewRegional("Florianópolis");
    setNewDescricao("Atuar no atendimento ao cliente. Exige-se boa aparência para recepção, idade máxima de 30 anos e candidatas preferencialmente do sexo feminino por questão de imagem corporativa.");
    setNewObrigatorios("Ensino Médio completo\nIdade máxima de 30 anos\nSexo feminino");
    setNewDesejaveis("Boa aparência e simpatia\nResidir perto");
  };

  const triggerAudit = async (vaga: Vaga) => {
    setAuditingVagaId(vaga.id);
    setAuditResult(null);
    try {
      const response = await fetch("/api/check-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaga }),
      });
      const data = await response.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditingVagaId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-col h-full" id="vagas_sidebar_container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
          Processos Seletivos (Vagas)
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Vaga
        </button>
      </div>

      {/* Add Vaga Form Modal/Section */}
      {showAddForm && (
        <div className="mb-5 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 relative">
          <button
            onClick={() => setShowAddForm(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1">
            Novo Processo Seletivo
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Título da Vaga *</label>
              <input
                type="text"
                required
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                placeholder="Ex: Engenheiro de Segurança do Trabalho"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Entidade FIESC</label>
                <select
                  value={newEntidade}
                  onChange={(e) => setNewEntidade(e.target.value as Entidade)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white"
                >
                  <option value="SENAI">SENAI (Profissional)</option>
                  <option value="SESI">SESI (Saúde/Segurança)</option>
                  <option value="IEL">IEL (Estágio/Carreira)</option>
                  <option value="FIESC">FIESC Corporativo</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Regional (SC)</label>
                <select
                  value={newRegional}
                  onChange={(e) => setNewRegional(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white"
                >
                  {regionals.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Descrição do Cargo *</label>
              <textarea
                required
                rows={3}
                value={newDescricao}
                onChange={(e) => setNewDescricao(e.target.value)}
                placeholder="Descreva as atribuições diárias de forma técnica e objetiva..."
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Requisitos Obrigatórios (Um por linha)</label>
              <textarea
                rows={2}
                value={newObrigatorios}
                onChange={(e) => setNewObrigatorios(e.target.value)}
                placeholder="Ex: Registro ativo no CRM-SC&#10;Graduação em Medicina"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Requisitos Desejáveis (Um por linha)</label>
              <textarea
                rows={2}
                value={newDesejaveis}
                onChange={(e) => setNewDesejaveis(e.target.value)}
                placeholder="Ex: Especialização concluída&#10;Inglês Intermediário"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={loadDiscriminatoryTemplate}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-medium underline flex items-center gap-0.5 cursor-pointer"
                title="Preenche a vaga com termos de gênero e idade para testar o filtro do copiloto"
              >
                Carregar template discriminatório para teste
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-semibold"
                >
                  Salvar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar vagas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>

        {/* Entity Filters */}
        <div className="flex flex-wrap gap-1">
          {["TODAS", "SENAI", "SESI", "IEL", "FIESC"].map((ent) => (
            <button
              key={ent}
              onClick={() => setSelectedEntidadeFilter(ent)}
              className={`text-[10px] px-2 py-1 rounded font-medium transition cursor-pointer ${
                selectedEntidadeFilter === ent
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] lg:max-h-none">
        {filteredVagas.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhuma vaga encontrada para os filtros aplicados.
          </div>
        ) : (
          filteredVagas.map((vaga) => {
            const styles = getEntityStyle(vaga.entidade);
            const isSelected = selectedVaga?.id === vaga.id;
            return (
              <div
                key={vaga.id}
                onClick={() => onSelectVaga(vaga)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative hover:shadow-md ${
                  isSelected
                    ? styles.borderSelected + " bg-slate-50/80"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${styles.badge}`}>
                    {vaga.entidade} - {vaga.regional}
                  </span>
                  <span className={`text-[9px] font-medium px-2 py-0.5 rounded ${
                    vaga.status === "Aberta" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700"
                  }`}>
                    {vaga.status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-800 leading-tight mb-1">
                  {vaga.titulo}
                </h3>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                  {vaga.descricao}
                </p>

                {/* Audit Action Banner */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">Criado em {vaga.dataCriacao}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerAudit(vaga);
                    }}
                    disabled={auditingVagaId !== null}
                    className="text-[10px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200/80 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {auditingVagaId === vaga.id ? "Auditando..." : "Auditar Vaga"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Audit Result Display (Lightbox/Inline Popup) */}
      {auditResult && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 relative">
          <button
            onClick={() => setAuditResult(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4.5 h-4.5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            {auditResult.seguro ? (
              <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="bg-rose-500/10 p-1 rounded-full text-rose-600 animate-pulse">
                <ShieldAlert className="w-4 h-4" />
              </div>
            )}
            <h4 className="text-xs font-bold text-slate-800">
              {auditResult.seguro ? "Vaga em Conformidade Ética" : "Alertas Éticos Identificados"}
            </h4>
          </div>

          {!auditResult.seguro && (
            <div className="space-y-1.5 mb-3">
              {auditResult.alertas.map((alerta, idx) => (
                <div key={idx} className="flex gap-1.5 text-[10px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 leading-normal">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{alerta}</span>
                </div>
              ))}
            </div>
          )}

          {auditResult.seguro && (
            <p className="text-[10px] text-emerald-700 mb-3 bg-emerald-50 p-2 rounded border border-emerald-100 leading-normal">
              A vaga está em plena conformidade com as diretrizes do ATS FIESC e os preceitos de não-discriminação e LGPD.
            </p>
          )}

          {auditResult.sugestoes.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sugestões de Redação Técnica:</h5>
              <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-1">
                {auditResult.sugestoes.map((sug, idx) => (
                  <li key={idx} className="leading-snug">{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Explanatory Info Card based on selected vacancy entity */}
      {selectedVaga && (
        <div className={`mt-4 p-3 rounded-xl border border-dashed transition duration-300 ${getEntityStyle(selectedVaga.entidade).bg}`}>
          <div className="flex items-center gap-1.5 mb-1 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Foco da {selectedVaga.entidade}</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            {getEntitySpecialty(selectedVaga.entidade)} Toda avaliação deste processo foca estritamente nessas particularidades.
          </p>
        </div>
      )}
    </div>
  );
}
