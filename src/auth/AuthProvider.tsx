import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { AuthContext, type AuthContextValue, type Profile } from "./authContext";

/**
 * Provê sessão + papel do Supabase para toda a aplicação.
 *
 * O gate de login (mostrar LoginPage vs. portal) vive no consumidor
 * (PortalLayout), não em um ProtectedRoute. Enquanto o Supabase não estiver
 * configurado, `authDisabled` fica true e o gate é ignorado — a demo roda como antes.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Carrega o profile (papel/entidade) quando o usuário muda.
  useEffect(() => {
    const uid = session?.user?.id;
    if (!isSupabaseConfigured || !uid) {
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("id, nome, role, entidade")
      .eq("id", uid)
      .single()
      .then(({ data }) => {
        if (active) setProfile((data as Profile | null) ?? null);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      authDisabled: !isSupabaseConfigured,
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? null,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
      },
      signUp: async (email, password, nome) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nome } },
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
