import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";
import { ShieldCheck, LogIn, UserPlus, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const { signIn, signUp, authDisabled } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      setSubmitting(false);
      if (error) setError(error);
      else navigate("/console");
    } else {
      const { error } = await signUp(email, password, nome);
      setSubmitting(false);
      if (error) setError(error);
      else setInfo("Conta criada. Verifique seu e-mail para confirmar e depois faça login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6 animate-scaleUp">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">ATS Sistema FIESC</h1>
          <p className="text-xs text-slate-500">
            {mode === "login" ? "Acesse o portal de recrutamento" : "Crie sua conta de candidato"}
          </p>
        </div>

        {authDisabled && (
          <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Supabase não configurado. Preencha o <code>.env</code> (ver <code>.env.example</code>)
              para habilitar o login real.
            </span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nome completo</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2">{error}</p>
          )}
          {info && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {submitting ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          {mode === "login" ? (
            <button
              onClick={() => { setMode("signup"); setError(null); setInfo(null); }}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Não tem conta? Cadastre-se
            </button>
          ) : (
            <button
              onClick={() => { setMode("login"); setError(null); setInfo(null); }}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Já tem conta? Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
