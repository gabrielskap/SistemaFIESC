import { useState } from "react";
import { Vaga, Candidato } from "../types";
import { entityPill } from "../lib/entityTheme";
import { CheckCircle, Clock, Calendar } from "lucide-react";

interface PortalCandidatoProps {
  vagas: Vaga[];
  candidatos: Candidato[];
  appliedMap: Record<string, string[]>; // candidateId -> vagaId[]
}

export default function PortalCandidato({ vagas, candidatos, appliedMap }: PortalCandidatoProps) {
  const [activeCandId, setActiveCandId] = useState<string>(candidatos[0]?.id || "");

  const activeCand = candidatos.find(c => c.id === activeCandId);

  // Derive applied vagas for selected candidate
  const appliedVagaIds = appliedMap[activeCandId] || [];
  
  // If nothing is in the map yet, let's prefill with some realistic ones to ensure it doesn't look blank
  const getSimulatedCandidaturas = () => {
    if (appliedVagaIds.length > 0) {
      return appliedVagaIds.map((id) => vagas.find((v) => v.id === id)).filter(Boolean) as Vaga[];
    }
    // Default fallback based on seedData interests to demonstrate the interface
    if (activeCandId === "cand_1") {
      return [vagas.find(v => v.id === "vaga_senai_1")].filter(Boolean) as Vaga[];
    }
    if (activeCandId === "cand_2") {
      return [vagas.find(v => v.id === "vaga_sesi_1")].filter(Boolean) as Vaga[];
    }
    if (activeCandId === "cand_3") {
      return [vagas.find(v => v.id === "vaga_iel_1")].filter(Boolean) as Vaga[];
    }
    if (activeCandId === "cand_4") {
      return [vagas.find(v => v.id === "vaga_fiesc_1")].filter(Boolean) as Vaga[];
    }
    return [];
  };

  const candidaturas = getSimulatedCandidaturas();

  // Determine stage and status message based on candidate-vaga pair
  const getCandidacyProgress = (candId: string, vagaId: string) => {
    // Determine deterministic stage based on length or id
    if (candId === "cand_1" && vagaId === "vaga_senai_1") {
      return {
        step: 3, // Entrevista
        status: "Entrevista Técnica Agendada",
        detail: "Sua avaliação pelo Estúdio FIESC obteve score excelente! A entrevista foi agendada para o dia 28/07 às 14:00 via MS Teams. O link foi enviado ao seu email.",
        badge: "bg-amber-100 text-amber-800"
      };
    }
    if (candId === "cand_2" && vagaId === "vaga_sesi_1") {
      return {
        step: 4, // Concluído/Aprovado
        status: "Aprovado em Processo Seletivo",
        detail: "Parabéns! Sua pontuação técnica e comportamental preenche todos os requisitos da vaga com louvor. Aguarde o contato da regional Florianópolis para admissão e exames admissionais.",
        badge: "bg-emerald-100 text-emerald-800"
      };
    }
    if (candId === "cand_3" && vagaId === "vaga_iel_1") {
      return {
        step: 2, // Teste/Avaliação
        status: "Aguardando Resposta do Case Técnico",
        detail: "Você foi classificado na triagem automatizada (Princípio 1 LGPD atendido). Acesse o módulo de avaliações para submeter seu estudo de caso sobre Recrutamento por Competências.",
        badge: "bg-blue-100 text-blue-800"
      };
    }
    if (candId === "cand_discriminatorio_teste") {
      return {
        step: 1, // Triagem
        status: "Em Triagem Ética de Currículo",
        detail: "Seu currículo foi anonimizado e está sob avaliação estrita de competências industriais pela banca homologada do Sistema FIESC.",
        badge: "bg-slate-100 text-slate-700"
      };
    }

    // Default for newly applied ones
    return {
      step: 1, // Triagem
      status: "Inscrição Efetuada com Sucesso",
      detail: "Seu cadastro foi importado com sucesso na base Benner. O motor de aderência FIESC fará a correspondência de habilidades em instantes.",
      badge: "bg-indigo-100 text-indigo-800"
    };
  };

  const stepsList = [
    { label: "Inscrito", stepNum: 0 },
    { label: "Triagem Técnica", stepNum: 1 },
    { label: "Teste Técnico", stepNum: 2 },
    { label: "Entrevista", stepNum: 3 },
    { label: "Aprovado/Fim", stepNum: 4 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn" id="portal_candidato_view">
      
      {/* Top Profile Selection for testing */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-widest block">Área Restrita do Candidato</span>
          <h2 className="text-base font-bold text-slate-900 uppercase">Minhas Candidaturas & Acompanhamento</h2>
          <p className="text-xs text-slate-500">
            Simule a visão de um candidato específico alterando o perfil no seletor ao lado.
          </p>
        </div>

        {/* Candidate Selector */}
        <div className="min-w-[280px]">
          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Visualizar como Candidato:</label>
          <select
            value={activeCandId}
            onChange={(e) => setActiveCandId(e.target.value)}
            className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none bg-white focus:ring-1 focus:ring-blue-600 font-semibold"
          >
            {candidatos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card Summary */}
        {activeCand && (
          <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 h-fit">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {activeCand.nome.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{activeCand.nome}</h3>
                <span className="text-[10px] text-slate-400 font-medium">CPF: {activeCand.cpf_mascarado}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Última Atualização</span>
                <p className="text-slate-700 font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Hoje, às {new Date().toLocaleTimeString().slice(0, 5)}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Habilidades Cadastradas</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeCand.habilidades.map((hab) => (
                    <span key={hab} className="text-[9px] bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded font-semibold text-slate-600">
                      {hab}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">LGPD & Segurança</span>
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-2.5 rounded-lg text-[10px] mt-1 leading-relaxed">
                  Seu cadastro está protegido pela Lei Geral de Proteção de Dados. Seus contatos estão mascarados contra consultas arbitrárias de terceiros.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Candidacies List */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>Inscrições Ativas ({candidaturas.length})</span>
          </h3>

          {candidaturas.length > 0 ? (
            candidaturas.map((vaga) => {
              const progress = getCandidacyProgress(activeCandId, vaga.id);
              
              return (
                <div key={vaga.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4 hover:border-blue-300 transition">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold border uppercase tracking-wider ${entityPill(vaga.entidade)}`}>
                        {vaga.entidade}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{vaga.titulo}</h4>
                      <p className="text-[10px] text-slate-400">Regional {vaga.regional} • Inscrito em {vaga.dataCriacao}</p>
                    </div>

                    <span className={`self-start sm:self-center text-[10px] font-bold px-2.5 py-1 rounded-full ${progress.badge}`}>
                      {progress.status}
                    </span>
                  </div>

                  {/* Step Progress Bar */}
                  <div className="py-2">
                    <div className="relative">
                      {/* Connection bar */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0" />
                      
                      {/* Active Connection bar */}
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${(progress.step / 4) * 100}%` }}
                      />

                      {/* Steps dots */}
                      <div className="relative flex justify-between z-10">
                        {stepsList.map((step) => {
                          const isDone = progress.step >= step.stepNum;
                          const isActive = progress.step === step.stepNum;
                          
                          return (
                            <div key={step.stepNum} className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border transition duration-300 ${
                                isDone
                                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                  : "bg-white border-slate-200 text-slate-400"
                              } ${isActive ? "ring-4 ring-blue-100" : ""}`}>
                                {isDone ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : (
                                  step.stepNum + 1
                                )}
                              </div>
                              <span className={`text-[9px] font-bold mt-1.5 hidden sm:inline ${
                                isDone ? "text-blue-700" : "text-slate-400"
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Details */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-1">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Parecer de Atividades</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {progress.detail}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Nenhuma candidatura registrada para este perfil.</p>
              <p className="text-[11px] text-slate-400">Acesse o "Portal de Vagas Públicas" para candidatar-se a qualquer oportunidade do Sistema FIESC!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
