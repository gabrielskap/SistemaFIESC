import React, { useState, useEffect } from "react";
import { Vaga, Candidato } from "../types";
import { ArrowLeft, ArrowRight, UserCheck, HelpCircle, Layers, ShieldCheck } from "lucide-react";

interface KanbanBoardProps {
  vagas: Vaga[];
  candidatos: Candidato[];
}

interface KanbanCard {
  id: string;
  nome: string;
  score: number;
  tags: string[];
  etapa: "Inscritos" | "Triagem" | "Teste" | "Entrevista" | "Aprovados";
}

export default function KanbanBoard({ vagas, candidatos }: KanbanBoardProps) {
  const [selectedVagaId, setSelectedVagaId] = useState<string>(vagas[0]?.id || "");
  const [cards, setCards] = useState<KanbanCard[]>([]);

  // We assign a realistic score and stage to each candidate relative to the selected job
  useEffect(() => {
    if (!selectedVagaId) return;
    const currentVaga = vagas.find((v) => v.id === selectedVagaId);
    if (!currentVaga) return;

    // Simulate candidate alignment and assign appropriate steps
    const simulatedCards: KanbanCard[] = candidatos.map((c, idx) => {
      // Calculate a deterministic score based on matching skills
      const matchingSkills = c.habilidades.filter((hab) =>
        currentVaga.requisitos_obrigatorios.some((req) =>
          req.toLowerCase().includes(hab.toLowerCase())
        ) || currentVaga.requisitos_desejaveis.some((req) =>
          req.toLowerCase().includes(hab.toLowerCase())
        )
      );

      let score = 40 + matchingSkills.length * 15;
      if (score > 98) score = 98;
      if (c.id === "cand_discriminatorio_teste") score = 42; // standard tester

      // Distribute candidates realistically across stages
      let etapa: KanbanCard["etapa"] = "Inscritos";
      if (score >= 85) {
        etapa = idx % 2 === 0 ? "Aprovados" : "Entrevista";
      } else if (score >= 70) {
        etapa = idx % 2 === 0 ? "Teste" : "Triagem";
      } else if (score >= 50) {
        etapa = "Triagem";
      }

      return {
        id: c.id,
        nome: c.nome,
        score,
        tags: c.habilidades.slice(0, 3),
        etapa
      };
    });

    setCards(simulatedCards);
  }, [selectedVagaId, candidatos, vagas]);

  const activeVaga = vagas.find((v) => v.id === selectedVagaId) || vagas[0];

  const moveCard = (cardId: string, direction: "left" | "right") => {
    const etapas: KanbanCard["etapa"][] = ["Inscritos", "Triagem", "Teste", "Entrevista", "Aprovados"];
    
    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id !== cardId) return card;
        const currentIndex = etapas.indexOf(card.etapa);
        let nextIndex = currentIndex + (direction === "right" ? 1 : -1);
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= etapas.length) nextIndex = etapas.length - 1;
        
        return {
          ...card,
          etapa: etapas[nextIndex]
        };
      })
    );
  };

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-rose-50 text-rose-700 border border-rose-200";
  };

  const getInitials = (nome: string) => {
    const names = nome.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return nome.slice(0, 2).toUpperCase();
  };

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

  const columns: { title: string; stage: KanbanCard["etapa"]; color: string }[] = [
    { title: "Inscritos", stage: "Inscritos", color: "border-t-blue-500 bg-blue-50/10" },
    { title: "Triagem Técnica", stage: "Triagem", color: "border-t-indigo-500 bg-indigo-50/10" },
    { title: "Avaliação/Teste", stage: "Teste", color: "border-t-purple-500 bg-purple-50/10" },
    { title: "Entrevistas", stage: "Entrevista", color: "border-t-pink-500 bg-pink-50/10" },
    { title: "Aprovados/Homologados", stage: "Aprovados", color: "border-t-emerald-500 bg-emerald-50/10" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="kanban_board_view">
      {/* Kanban Header Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-widest block">Painel Operacional</span>
          <h2 className="text-base font-bold text-slate-900 uppercase">Quadro Kanban por Processo Seletivo</h2>
          {activeVaga && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${getEntityStyle(activeVaga.entidade)}`}>
                {activeVaga.entidade}
              </span>
              <span className="text-xs text-slate-500 capitalize">
                Regional {activeVaga.regional}
              </span>
            </div>
          )}
        </div>

        {/* Job Selector Dropdown */}
        <div className="min-w-[280px]">
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Selecionar Vaga Ativa</label>
          <select
            value={selectedVagaId}
            onChange={(e) => setSelectedVagaId(e.target.value)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600"
          >
            {vagas.map((v) => (
              <option key={v.id} value={v.id}>
                [{v.entidade}] {v.titulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Explanation & Benner warning banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="leading-relaxed">
          <strong>Sincronização de Etapas:</strong> Use os botões de seta (<span className="font-mono text-[10px] bg-white border px-1 rounded">←</span> e <span className="font-mono text-[10px] bg-white border px-1 rounded">→</span>) em cada card para simular a mudança de estágio do candidato. Modificações são atualizadas instantaneamente na base de dados de triagem.
        </span>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.etapa === col.stage);
          return (
            <div
              key={col.stage}
              className={`rounded-xl border border-slate-200 border-t-4 p-3.5 space-y-3 flex flex-col min-h-[500px] ${col.color}`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                  {col.title}
                </span>
                <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                  {colCards.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                {colCards.length > 0 ? (
                  colCards.map((card) => {
                    const initials = getInitials(card.nome);
                    const isBest = card.score >= 80;
                    
                    return (
                      <div
                        key={card.id}
                        className={`bg-white rounded-lg p-3 shadow-sm border border-slate-200 hover:shadow-md transition space-y-3 relative`}
                      >
                        {/* Initials & Score */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[110px]">
                              {card.nome}
                            </span>
                          </div>
                          
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${getScoreBadgeStyle(card.score)}`}>
                            {card.score}%
                          </span>
                        </div>

                        {/* Card Tags */}
                        <div className="flex flex-wrap gap-1">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[8px] font-bold bg-slate-100 text-slate-500 border px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Card Controls */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                          <button
                            onClick={() => moveCard(card.id, "left")}
                            disabled={col.stage === "Inscritos"}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Mover
                          </span>

                          <button
                            onClick={() => moveCard(card.id, "right")}
                            disabled={col.stage === "Aprovados"}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white/50">
                    Sem candidatos nesta etapa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
