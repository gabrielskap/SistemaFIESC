import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { Entidade } from "../types";

export type AppRole = "admin" | "recrutador" | "candidato";

export interface Profile {
  id: string;
  nome: string;
  role: AppRole;
  entidade: Entidade | null;
}

export interface AuthContextValue {
  /** Sessão ainda sendo resolvida (getSession inicial). */
  loading: boolean;
  /** Profile (papel/entidade) ainda sendo carregado após a sessão. */
  profileLoading: boolean;
  /** true quando o Supabase não está configurado — o gate de login fica inativo. */
  authDisabled: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>.");
  return ctx;
};
