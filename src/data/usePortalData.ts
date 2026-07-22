import { useCallback, useEffect, useState } from "react";
import { Vaga, Candidato } from "../types";
import { initialVagas, initialCandidatos } from "./seedData";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { useAuth } from "../auth/authContext";
import {
  rowToVaga,
  rowToCandidato,
  vagaToInsert,
  candidatoToInsert,
  type VagaRow,
  type CandidatoRow,
} from "./mappers";

export interface PortalData {
  vagas: Vaga[];
  candidatos: Candidato[];
  /** candidato_id -> vaga_id[] (derivado de candidaturas). */
  appliedMap: Record<string, string[]>;
  loading: boolean;
  handleAddVaga: (data: Omit<Vaga, "id" | "dataCriacao">) => Promise<Vaga | null>;
  handleAddCandidato: (data: Omit<Candidato, "id" | "dataCandidatura">) => Promise<Candidato | null>;
  handleApply: (vagaId: string, candidatoId: string) => Promise<void>;
  reload: () => Promise<void>;
}

// appliedMap inicial para o modo demo (em memória, sem Supabase).
const DEMO_APPLIED: Record<string, string[]> = {
  cand_1: ["vaga_senai_1"],
  cand_2: ["vaga_sesi_1"],
  cand_3: ["vaga_iel_1"],
  cand_4: ["vaga_fiesc_1"],
  cand_5: ["vaga_senai_2"],
};

const today = () => new Date().toISOString().split("T")[0];

/**
 * Fonte única dos dados do portal.
 * - Supabase configurado: lê/grava no banco (protegido por RLS) e refaz o fetch
 *   quando a sessão muda (login/logout).
 * - Não configurado: cai no seed em memória, preservando a demo.
 */
export function usePortalData(): PortalData {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [vagas, setVagas] = useState<Vaga[]>(isSupabaseConfigured ? [] : initialVagas);
  const [candidatos, setCandidatos] = useState<Candidato[]>(
    isSupabaseConfigured ? [] : initialCandidatos
  );
  const [appliedMap, setAppliedMap] = useState<Record<string, string[]>>(
    isSupabaseConfigured ? {} : DEMO_APPLIED
  );
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [vagasRes, candRes, candidaturasRes] = await Promise.all([
      supabase.from("vagas").select("*").order("data_criacao", { ascending: false }),
      supabase.from("candidatos").select("*").order("data_candidatura", { ascending: false }),
      supabase.from("candidaturas").select("vaga_id, candidato_id"),
    ]);

    if (vagasRes.error) console.error("[portal] vagas:", vagasRes.error.message);
    else setVagas(((vagasRes.data as VagaRow[] | null) ?? []).map(rowToVaga));

    if (candRes.error) console.error("[portal] candidatos:", candRes.error.message);
    else setCandidatos(((candRes.data as CandidatoRow[] | null) ?? []).map(rowToCandidato));

    if (candidaturasRes.error) console.error("[portal] candidaturas:", candidaturasRes.error.message);
    else {
      const map: Record<string, string[]> = {};
      for (const c of (candidaturasRes.data as { vaga_id: string; candidato_id: string }[] | null) ??
        []) {
        (map[c.candidato_id] ??= []).push(c.vaga_id);
      }
      setAppliedMap(map);
    }
    setLoading(false);
  }, []);

  // Recarrega ao montar e sempre que o usuário logado mudar.
  useEffect(() => {
    void reload();
  }, [reload, userId]);

  const handleAddVaga = useCallback(
    async (data: Omit<Vaga, "id" | "dataCriacao">): Promise<Vaga | null> => {
      if (!isSupabaseConfigured) {
        const v: Vaga = { ...data, id: `vaga_${Date.now()}`, dataCriacao: today() };
        setVagas((prev) => [v, ...prev]);
        return v;
      }
      const { data: row, error } = await supabase
        .from("vagas")
        .insert(vagaToInsert(data))
        .select("*")
        .single();
      if (error || !row) {
        console.error("[portal] criar vaga:", error?.message);
        return null;
      }
      const v = rowToVaga(row as VagaRow);
      setVagas((prev) => [v, ...prev]);
      return v;
    },
    []
  );

  const handleAddCandidato = useCallback(
    async (data: Omit<Candidato, "id" | "dataCandidatura">): Promise<Candidato | null> => {
      if (!isSupabaseConfigured) {
        const c: Candidato = { ...data, id: `cand_${Date.now()}`, dataCandidatura: today() };
        setCandidatos((prev) => [c, ...prev]);
        return c;
      }
      const { data: row, error } = await supabase
        .from("candidatos")
        .insert(candidatoToInsert(data))
        .select("*")
        .single();
      if (error || !row) {
        console.error("[portal] criar candidato:", error?.message);
        return null;
      }
      const c = rowToCandidato(row as CandidatoRow);
      setCandidatos((prev) => [c, ...prev]);
      return c;
    },
    []
  );

  const handleApply = useCallback(async (vagaId: string, candidatoId: string): Promise<void> => {
    // Atualização otimista do appliedMap (usada pela UI).
    setAppliedMap((prev) => ({
      ...prev,
      [candidatoId]: Array.from(new Set([...(prev[candidatoId] || []), vagaId])),
    }));
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from("candidaturas")
      .upsert(
        { vaga_id: vagaId, candidato_id: candidatoId },
        { onConflict: "vaga_id,candidato_id" }
      );
    if (error) console.error("[portal] candidatar:", error.message);
  }, []);

  return {
    vagas,
    candidatos,
    appliedMap,
    loading,
    handleAddVaga,
    handleAddCandidato,
    handleApply,
    reload,
  };
}
