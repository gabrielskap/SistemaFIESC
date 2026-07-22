import { createClient } from "@supabase/supabase-js";

/**
 * Front-end Supabase client (chave ANON, pública).
 *
 * O acesso a dados é regido pela RLS do banco + o JWT do usuário logado.
 * NUNCA use a service_role aqui — ela vive apenas no servidor
 * (ver `server/supabaseAdmin.ts`).
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** true quando as variáveis do Supabase estão configuradas no .env. */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // Não derruba o app em tempo de import — as chamadas é que falharão até
  // o .env ser preenchido (ver .env.example).
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. " +
      "Configure o .env (ver .env.example) para habilitar auth e persistência."
  );
}

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "public-anon-placeholder",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);
