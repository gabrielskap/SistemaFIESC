import { supabaseAdmin } from "../supabaseAdmin";

/**
 * Camada de persistência do servidor (service-role, ACIMA da RLS).
 *
 * Todas as gravações são "best-effort": se o Supabase não estiver configurado
 * (modo demo) ou a escrita falhar, a função apenas registra o erro e retorna —
 * nunca lança para o caminho da resposta HTTP. Assim a triagem/IA continua
 * respondendo mesmo sem banco, e ligar o banco só ADICIONA a trilha/histórico.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** true para uuids reais do banco (o seed em memória usa ids como "cand_1"). */
export function isUuid(v: unknown): v is string {
  return typeof v === "string" && UUID_RE.test(v);
}

// ── Config (pesos e templates) — espelha os defaults semeados em 0003 ────────
export interface PesosConfig {
  peso_obrigatorio_base: number;
  peso_desejavel_base: number;
  multiplicador_obrigatorio: number;
  limiar_avancar: number;
  limiar_nao_recomendado: number;
}

export const DEFAULT_PESOS: PesosConfig = {
  peso_obrigatorio_base: 5,
  peso_desejavel_base: 4,
  multiplicador_obrigatorio: 2,
  limiar_avancar: 75,
  limiar_nao_recomendado: 45,
};

export interface TemplatesConfig {
  avancar: string;
  revisar_manual: string;
  nao_recomendado: string;
}

export const DEFAULT_TEMPLATES: TemplatesConfig = {
  avancar: "Parabéns! Seu perfil avançou para a próxima etapa.",
  revisar_manual: "Seu perfil está em análise detalhada.",
  nao_recomendado: "Agradecemos sua participação no processo seletivo.",
};

// Cache simples em memória para não bater no banco a cada requisição.
const cache = new Map<string, { value: unknown; at: number }>();
const CONFIG_TTL_MS = 30_000;

/**
 * Lê `config.valor` para a `chave`, mesclado sobre `fallback` (defaults).
 * Sem Supabase → devolve o fallback. Erros → fallback (nunca lança).
 */
export async function getConfig<T extends object>(chave: string, fallback: T): Promise<T> {
  if (!supabaseAdmin) return fallback;
  const hit = cache.get(chave);
  if (hit && Date.now() - hit.at < CONFIG_TTL_MS) return hit.value as T;
  try {
    const { data, error } = await supabaseAdmin
      .from("config")
      .select("valor")
      .eq("chave", chave)
      .single();
    if (error || !data?.valor) return fallback;
    const value = { ...fallback, ...(data.valor as Partial<T>) } as T;
    cache.set(chave, { value, at: Date.now() });
    return value;
  } catch {
    return fallback;
  }
}

// ── Avaliações (resultado de triagem) ───────────────────────────────────────
export interface AvaliacaoRow {
  candidato_id: string;
  vaga_id: string;
  score_aderencia: number;
  atende_requisitos_obrigatorios: boolean;
  requisitos_atendidos: string[];
  requisitos_nao_atendidos: string[];
  devolutiva: string;
  recomendacao: string;
  possivel_alerta_discriminacao?: boolean;
  alerta_detalhes?: string | null;
  created_by?: string | null;
}

/** Grava uma avaliação. Ignora silenciosamente ids não-uuid (demo) / sem banco. */
export async function saveAvaliacao(row: AvaliacaoRow): Promise<void> {
  if (!supabaseAdmin) return;
  if (!isUuid(row.candidato_id) || !isUuid(row.vaga_id)) return;
  try {
    const { error } = await supabaseAdmin.from("avaliacoes").insert({
      candidato_id: row.candidato_id,
      vaga_id: row.vaga_id,
      score_aderencia: row.score_aderencia,
      atende_requisitos_obrigatorios: row.atende_requisitos_obrigatorios,
      requisitos_atendidos: row.requisitos_atendidos,
      requisitos_nao_atendidos: row.requisitos_nao_atendidos,
      devolutiva: row.devolutiva,
      recomendacao: row.recomendacao,
      possivel_alerta_discriminacao: row.possivel_alerta_discriminacao ?? false,
      alerta_detalhes: row.alerta_detalhes ?? null,
      created_by: row.created_by ?? null,
    });
    if (error) console.error("[repo] saveAvaliacao:", error.message);
  } catch (e) {
    console.error("[repo] saveAvaliacao:", e);
  }
}

// ── Trilha de auditoria ─────────────────────────────────────────────────────
export interface AuditEntry {
  actor_id?: string | null;
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}

/** Grava uma linha de auditoria (sem policy de INSERT: só via service-role). */
export async function logAudit(entry: AuditEntry): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    const { error } = await supabaseAdmin.from("audit_logs").insert({
      actor_id: isUuid(entry.actor_id) ? entry.actor_id : null,
      action: entry.action,
      entity: entry.entity ?? null,
      entity_id: entry.entity_id ?? null,
      metadata: entry.metadata ?? {},
    });
    if (error) console.error("[repo] logAudit:", error.message);
  } catch (e) {
    console.error("[repo] logAudit:", e);
  }
}
