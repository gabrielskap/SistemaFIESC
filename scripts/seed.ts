/**
 * Seed do banco Supabase a partir de src/data/seedData.ts.
 *
 * Uso:  npm run db:seed
 * Requer no .env: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
 *
 * Idempotente: usa `external_ref` (id textual do seed) como chave de conflito,
 * então rodar de novo atualiza em vez de duplicar.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { initialVagas, initialCandidatos } from "../src/data/seedData";

// URL não é segredo — usa a mesma do front (VITE_SUPABASE_URL) para evitar
// duplicação no .env. SUPABASE_URL é só um override opcional.
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// Aceita o nome padrão do self-hosted (SERVICE_ROLE_KEY) como fallback.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (ou SERVICE_ROLE_KEY) no .env. Veja .env.example."
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Converte string[] em [{ criterio, peso, eliminatorio }]. */
function toRequisitos(list: string[], obrigatorio: boolean) {
  const base = obrigatorio ? 5 : 4;
  return list.map((criterio, idx) => ({
    criterio,
    peso: Math.max(base - idx, 1),
    // Por padrão só o 1º obrigatório é eliminatório; recrutador ajusta depois.
    eliminatorio: obrigatorio && idx === 0,
  }));
}

// Vínculos iniciais candidato → vaga (espelha o appliedMap do PortalLayout).
const APPLIED: Record<string, string> = {
  cand_1: "vaga_senai_1",
  cand_2: "vaga_sesi_1",
  cand_3: "vaga_iel_1",
  cand_4: "vaga_fiesc_1",
  cand_5: "vaga_senai_2",
};

async function main() {
  // 1) Vagas
  const vagaRows = initialVagas.map((v) => ({
    external_ref: v.id,
    titulo: v.titulo,
    entidade: v.entidade,
    regional: v.regional,
    descricao: v.descricao,
    requisitos_obrigatorios: toRequisitos(v.requisitos_obrigatorios, true),
    requisitos_desejaveis: toRequisitos(v.requisitos_desejaveis, false),
    status: v.status,
    data_criacao: v.dataCriacao,
  }));
  const { data: vagas, error: vagasErr } = await db
    .from("vagas")
    .upsert(vagaRows, { onConflict: "external_ref" })
    .select("id, external_ref");
  if (vagasErr) throw vagasErr;
  console.log(`✓ ${vagas?.length ?? 0} vagas`);

  // 2) Candidatos
  const candRows = initialCandidatos.map((c) => ({
    external_ref: c.id,
    nome: c.nome,
    experiencia: c.experiencia,
    formacao: c.formacao,
    habilidades: c.habilidades,
    certificacoes: c.certificacoes,
    cpf_mascarado: c.cpf_mascarado,
    contato_mascarado: c.contato_mascarado,
    data_candidatura: c.dataCandidatura,
  }));
  const { data: candidatos, error: candErr } = await db
    .from("candidatos")
    .upsert(candRows, { onConflict: "external_ref" })
    .select("id, external_ref");
  if (candErr) throw candErr;
  console.log(`✓ ${candidatos?.length ?? 0} candidatos`);

  // 3) Candidaturas (usa os uuids recém-criados, mapeados por external_ref)
  const vagaId = new Map((vagas ?? []).map((v) => [v.external_ref, v.id]));
  const candId = new Map((candidatos ?? []).map((c) => [c.external_ref, c.id]));
  const candidaturaRows = Object.entries(APPLIED)
    .map(([candRef, vagaRef]) => {
      const vaga_id = vagaId.get(vagaRef);
      const candidato_id = candId.get(candRef);
      if (!vaga_id || !candidato_id) return null;
      return { vaga_id, candidato_id, etapa: "Triagem", status: "Em triagem" };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (candidaturaRows.length) {
    const { error: candidaturaErr } = await db
      .from("candidaturas")
      .upsert(candidaturaRows, { onConflict: "vaga_id,candidato_id" });
    if (candidaturaErr) throw candidaturaErr;
  }
  console.log(`✓ ${candidaturaRows.length} candidaturas`);

  console.log("Seed concluído.");
}

main().catch((err) => {
  console.error("Falha no seed:", err);
  process.exit(1);
});
