/**
 * Cria usuários de teste (admin / recrutador / candidato) e define seus papéis.
 * Uso:  npm run db:seed:users
 * Requer: VITE_SUPABASE_URL + SERVICE_ROLE (service_role) no .env
 *         e a migration 0004 aplicada (senão o update de role é bloqueado).
 *
 * Senha (dev): variável SEED_USER_PASSWORD ou o default abaixo. TROQUE em produção.
 * Idempotente: se o usuário já existe, apenas re-aplica o papel.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltam VITE_SUPABASE_URL / SERVICE_ROLE key no .env.");
  process.exit(1);
}

const PASSWORD = process.env.SEED_USER_PASSWORD || "FiescDev!2026";

interface SeedUser {
  email: string;
  nome: string;
  role: "admin" | "recrutador" | "candidato";
  entidade: string | null;
}

const USERS: SeedUser[] = [
  { email: "admin@fiesc.dev", nome: "Admin FIESC", role: "admin", entidade: null },
  { email: "recrutador.senai@fiesc.dev", nome: "Recrutador SENAI", role: "recrutador", entidade: "SENAI" },
  { email: "candidato@fiesc.dev", nome: "Candidato Teste", role: "candidato", entidade: null },
];

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function findUserId(email: string): Promise<string | null> {
  const { data, error } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return found?.id ?? null;
}

async function main() {
  for (const u of USERS) {
    let userId = await findUserId(u.email);
    if (userId) {
      console.log(`• ${u.email} já existe`);
    } else {
      const { data, error } = await db.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { nome: u.nome },
      });
      if (error) throw error;
      userId = data.user.id;
      console.log(`✓ criado ${u.email}`);
    }

    const { error: upErr } = await db
      .from("profiles")
      .upsert({ id: userId, nome: u.nome, role: u.role, entidade: u.entidade });
    if (upErr) {
      console.log(`  ! falha ao definir papel de ${u.email}: ${upErr.message}`);
      console.log("    (a migration 0004 foi aplicada?)");
    } else {
      console.log(`  papel: ${u.role}${u.entidade ? ` (${u.entidade})` : ""}`);
    }
  }
  console.log(`\nSenha de todos (dev): ${PASSWORD}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
