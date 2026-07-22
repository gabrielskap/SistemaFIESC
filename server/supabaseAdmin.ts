import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client usando a SERVICE ROLE.
 *
 * Opera ACIMA da RLS — use apenas no servidor (Express) para gravar
 * avaliações/correções/auditoria e para o direito ao esquecimento.
 * A chave `SUPABASE_SERVICE_ROLE_KEY` NUNCA deve ir para o bundle do front.
 *
 * Exporta `null` quando as variáveis não estão configuradas, para que o
 * servidor suba mesmo sem Supabase (endpoints de IA seguem funcionando com o
 * fallback local). Sempre verifique `if (supabaseAdmin) { ... }` antes de usar.
 */
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: SupabaseClient | null =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

if (!supabaseAdmin) {
  console.warn(
    "[supabase-admin] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ausentes; " +
      "persistência e auditoria no servidor estão desabilitadas até configurar o .env."
  );
}
