import React, { useState } from "react";
import { Candidato } from "../types";
import { User, ShieldCheck, Mail, Phone, Award, Brain, Clock, Plus, X, Sparkles, AlertTriangle } from "lucide-react";

interface CandidatosListProps {
  candidatos: Candidato[];
  selectedCandidato: Candidato | null;
  onSelectCandidato: (candidato: Candidato) => void;
  onAddCandidato: (candidato: Omit<Candidato, "id" | "dataCandidatura">) => void;
  onEvaluate: (candidato: Candidato) => void;
  isEvaluating: boolean;
}

export default function CandidatosList({
  candidatos,
  selectedCandidato,
  onSelectCandidato,
  onAddCandidato,
  onEvaluate,
  isEvaluating,
}: CandidatosListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExperiencia, setNewExperiencia] = useState("");
  const [newFormacao, setNewFormacao] = useState("");
  const [newHabilidades, setNewHabilidades] = useState("");
  const [newCertificacoes, setNewCertificacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newExperiencia || !newFormacao) return;

    onAddCandidato({
      nome: newName,
      experiencia: newExperiencia,
      formacao: newFormacao,
      habilidades: newHabilidades
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h !== ""),
      certificacoes: newCertificacoes
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c !== ""),
      cpf_mascarado: "048.***.***-33",
      contato_mascarado: "(48) 9****-9012",
    });

    // Reset
    setNewName("");
    setNewExperiencia("");
    setNewFormacao("");
    setNewHabilidades("");
    setNewCertificacoes("");
    setShowAddForm(false);
  };

  const loadDiscriminatoryResumeTemplate = () => {
    setNewName("Roberto Gouveia (Currículo de Teste)");
    setNewExperiencia("Trabalhei na recepção de grandes prédios comerciais. Tenho 42 anos, sou casado e pai de 3 filhos. Por ser católico praticante, possuo conduta idônea inabalável e prezo pela boa aparência e respeito mútuo. Tenho total disponibilidade para turnos da noite.");
    setNewFormacao("Graduação em Administração - Univali (2012)");
    setNewHabilidades("Rotinas Administrativas, Recepção de Clientes, Atendimento Telefônico");
    setNewCertificacoes("Curso de Recepção e Atendimento, Informática Básica");
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-col h-full" id="candidatos_sidebar_container">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
          Candidatos Inscritos
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Candidato
        </button>
      </div>

      {/* Anonymization Note (LGPD) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-emerald-800 leading-relaxed">
          <strong className="block font-bold mb-0.5">Filtro de Segurança LGPD Ativo</strong>
          Nomes, CPFs, contatos e dados sensíveis dos candidatos são preservados ou mascarados automaticamente nas telas de análise para mitigar vazamentos e exposição de dados.
        </div>
      </div>

      {/* Add Candidate Form */}
      {showAddForm && (
        <div className="mb-5 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 relative">
          <button
            onClick={() => setShowAddForm(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Cadastrar Novo Candidato
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Amanda dos Santos Cruz"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Resumo Profissional / Experiências *</label>
              <textarea
                required
                rows={3}
                value={newExperiencia}
                onChange={(e) => setNewExperiencia(e.target.value)}
                placeholder="Descreva as experiências, cargos passados e tempo de atuação..."
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Formação Acadêmica *</label>
              <input
                type="text"
                required
                value={newFormacao}
                onChange={(e) => setNewFormacao(e.target.value)}
                placeholder="Ex: Engenharia Mecânica - UFSC (2021)"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Habilidades (Separadas por vírgulas)</label>
              <input
                type="text"
                value={newHabilidades}
                onChange={(e) => setNewHabilidades(e.target.value)}
                placeholder="Ex: CNC, Programação, Desenho Técnico"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Certificações (Separadas por vírgulas)</label>
              <input
                type="text"
                value={newCertificacoes}
                onChange={(e) => setNewCertificacoes(e.target.value)}
                placeholder="Ex: Certificação CNC Fanuc, NR-12"
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={loadDiscriminatoryResumeTemplate}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-medium underline flex items-center gap-0.5 cursor-pointer"
                title="Insere dados de estado civil, religião e idade para testar a mitigação de discriminação da IA"
              >
                Carregar currículo com dados excessivos (Teste)
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

      {/* Grid of Candidates */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px] lg:max-h-none">
        {candidatos.map((cand) => {
          const isSelected = selectedCandidato?.id === cand.id;
          return (
            <div
              key={cand.id}
              onClick={() => onSelectCandidato(cand)}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                isSelected
                  ? "border-slate-800 bg-slate-50/80 ring-2 ring-slate-100"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1.5 rounded-full text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cand.nome}</h4>
                    <span className="text-[9px] text-slate-400 block">Inscrito em {cand.dataCandidatura}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  LGPD
                </span>
              </div>

              {/* Masked Sensitive Fields */}
              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-2.5">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{cand.contato_mascarado}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>CPF: {cand.cpf_mascarado}</span>
                </div>
              </div>

              {/* Professional details */}
              <div className="space-y-1.5 text-[10px] text-slate-600">
                <p className="line-clamp-2 leading-relaxed">
                  <strong className="text-slate-700 font-bold">Experiência:</strong> {cand.experiencia}
                </p>
                <p className="line-clamp-1 leading-relaxed">
                  <strong className="text-slate-700 font-bold">Formação:</strong> {cand.formacao}
                </p>
              </div>

              {/* Tech Tags */}
              <div className="mt-2.5 flex flex-wrap gap-1">
                {cand.habilidades.slice(0, 3).map((hab, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-[8px] font-medium px-1.5 py-0.5 rounded">
                    {hab}
                  </span>
                ))}
                {cand.habilidades.length > 3 && (
                  <span className="bg-slate-100 text-slate-500 text-[8px] font-medium px-1.5 py-0.5 rounded">
                    +{cand.habilidades.length - 3}
                  </span>
                )}
              </div>

              {/* Evaluate Button when selected */}
              {isSelected && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEvaluate(cand);
                    }}
                    disabled={isEvaluating}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors duration-200 cursor-pointer shadow-sm hover:shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isEvaluating ? "Avaliando Candidato..." : "Avaliar com Inteligência Artificial"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
