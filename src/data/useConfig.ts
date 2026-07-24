import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

/**
 * Config editável do ATS (tabela `config`, key-value jsonb).
 *
 * Leitura/escrita pela RLS: `config_read` (recrutador/admin) e
 * `config_write_admin` (só admin). Sem Supabase → devolve os defaults
 * (mesmos semeados na migration 0003) e `configured=false`.
 */
export interface PesosPadrao {
  peso_obrigatorio_base: number;
  peso_desejavel_base: number;
  multiplicador_obrigatorio: number;
  limiar_avancar: number;
  limiar_nao_recomendado: number;
}

export interface TemplatesMensagem {
  avancar: string;
  revisar_manual: string;
  nao_recomendado: string;
}

export const DEFAULT_PESOS: PesosPadrao = {
  peso_obrigatorio_base: 5,
  peso_desejavel_base: 4,
  multiplicador_obrigatorio: 2,
  limiar_avancar: 75,
  limiar_nao_recomendado: 45,
};

export const DEFAULT_TEMPLATES: TemplatesMensagem = {
  avancar: "Parabéns! Seu perfil avançou para a próxima etapa.",
  revisar_manual: "Seu perfil está em análise detalhada.",
  nao_recomendado: "Agradecemos sua participação no processo seletivo.",
};

export type ConfigChave = "pesos_padrao" | "templates_mensagem";

export interface UseConfig {
  pesos: PesosPadrao;
  templates: TemplatesMensagem;
  loading: boolean;
  configured: boolean;
  error: string | null;
  reload: () => Promise<void>;
  /** Salva uma chave; retorna a mensagem de erro ou null em sucesso. */
  save: (chave: ConfigChave, valor: PesosPadrao | TemplatesMensagem) => Promise<string | null>;
}

export function useConfig(): UseConfig {
  const configured = isSupabaseConfigured;
  const [pesos, setPesos] = useState<PesosPadrao>(DEFAULT_PESOS);
  const [templates, setTemplates] = useState<TemplatesMensagem>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState<boolean>(configured);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("config").select("chave, valor");
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    for (const row of (data as { chave: string; valor: unknown }[] | null) ?? []) {
      if (row.chave === "pesos_padrao") {
        setPesos({ ...DEFAULT_PESOS, ...(row.valor as Partial<PesosPadrao>) });
      } else if (row.chave === "templates_mensagem") {
        setTemplates({ ...DEFAULT_TEMPLATES, ...(row.valor as Partial<TemplatesMensagem>) });
      }
    }
    setLoading(false);
  }, [configured]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (chave: ConfigChave, valor: PesosPadrao | TemplatesMensagem): Promise<string | null> => {
      if (!configured) return "Supabase não configurado.";
      const { error } = await supabase.from("config").upsert({ chave, valor }, { onConflict: "chave" });
      if (error) return error.message;
      if (chave === "pesos_padrao") setPesos(valor as PesosPadrao);
      else setTemplates(valor as TemplatesMensagem);
      return null;
    },
    [configured]
  );

  return { pesos, templates, loading, configured, error, reload, save };
}
