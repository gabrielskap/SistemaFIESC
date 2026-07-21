import { Dispatch, SetStateAction } from "react";
import { useOutletContext } from "react-router-dom";
import { Vaga, Candidato } from "../types";

/**
 * Shared portal state provided by PortalLayout to every routed page via the
 * router <Outlet context={...}>. Consume it with the usePortal() hook.
 */
export interface PortalContextValue {
  vagas: Vaga[];
  candidatos: Candidato[];
  selectedVaga: Vaga | null;
  selectedCandidato: Candidato | null;
  appliedMap: Record<string, string[]>;
  setSelectedVaga: Dispatch<SetStateAction<Vaga | null>>;
  setSelectedCandidato: Dispatch<SetStateAction<Candidato | null>>;
  handleSelectVaga: (vaga: Vaga) => void;
  handleSelectCandidato: (candidato: Candidato) => void;
  handleAddVaga: (data: Omit<Vaga, "id" | "dataCriacao">) => void;
  handleAddCandidato: (data: Omit<Candidato, "id" | "dataCandidatura">) => void;
  handleApply: (vagaId: string, candidatoId: string) => void;
}

export const usePortal = () => useOutletContext<PortalContextValue>();
