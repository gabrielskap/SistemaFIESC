/**
 * Health-check do Supabase.  Uso: npm run db:check
 *
 * Usa a ANON key (sempre disponível) para testar conectividade e existência das
 * tabelas. Se a SERVICE_ROLE key for um JWT válido, também conta as linhas
 * (bypassa a RLS).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;
// Aceita o nome padrão do self-hosted (SERVICE_ROLE_KEY) como fallback.
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!url || !anon) {
  console.error("Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no .env.");
  process.exit(1);
}

async function main() {
  console.log("Instância:", url);

  const anonClient = createClient(url!, anon!, { auth: { persistSession: false } });
  const { error } = await anonClient.from("vagas").select("id", { count: "exact", head: true });
  if (error) {
    if (error.code === "42P01") {
      console.log("✗ Tabela 'vagas' NÃO existe — migrations não aplicadas.");
    } else {
      console.log(`• anon → vagas: ${error.code ?? ""} ${error.message} (tabela existe; RLS ativa)`);
    }
  } else {
    console.log("✓ Tabela 'vagas' existe e responde (migrations aplicadas).");
  }

  const isPlaceholder =
    !service || service.trim() === "" || service === "YOUR_SERVICE_ROLE_KEY";

  if (isPlaceholder) {
    console.log("• SERVICE_ROLE ausente/placeholder — preencha a chave real no .env.");
    return;
  }

  // Formato detectado (sem exibir o valor): JWT legado (eyJ) ou nova chave (sb_secret_).
  const fmt = service!.startsWith("eyJ")
    ? "JWT legado (eyJ)"
    : service!.startsWith("sb_secret_")
      ? "nova chave secreta (sb_secret_)"
      : "formato desconhecido";
  console.log(`service_role presente (${fmt}) — testando contagem:`);

  const admin = createClient(url!, service!, { auth: { persistSession: false } });
  for (const t of ["profiles", "vagas", "candidatos", "candidaturas", "avaliacoes"]) {
    const { count, error } = await admin.from(t).select("*", { count: "exact", head: true });
    console.log(error ? `  ${t}: erro — ${error.message}` : `  ${t}: ${count} linha(s)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
