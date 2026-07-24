import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * `fetch` para as rotas `/api/*` com o Bearer JWT do Supabase anexado.
 *
 * O servidor (server/authMiddleware.ts) exige o token quando o Supabase está
 * configurado. Em modo demo (sem Supabase / sem sessão) cai no `fetch` normal —
 * o servidor também está em modo demo e não exige token.
 *
 * Preserva quaisquer headers já passados pelo chamador (ex.: Content-Type).
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
