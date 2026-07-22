import { useState, useEffect, CSSProperties } from "react";
import { Outlet, NavLink, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import {
  Briefcase, FileCheck2, Sparkles, Layers, Award,
  ChevronRight, LayoutDashboard, Settings, Shield, User, Menu, X,
} from "lucide-react";
import { Vaga, Candidato } from "../types";
import { initialVagas, initialCandidatos } from "../data/seedData";
import { PortalContextValue } from "../portal/portalContext";

type LucideIcon = typeof LayoutDashboard;

interface ModuleItem {
  to: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
}

const recrutadorModules: ModuleItem[] = [
  { to: "/console", label: "Console / Dashboard", icon: LayoutDashboard, iconColor: "text-blue-400" },
  { to: "/processos", label: "Processos (Kanban)", icon: Layers, iconColor: "text-emerald-400" },
  { to: "/triagem", label: "Triagem Inteligente IA", icon: Sparkles, iconColor: "text-indigo-400" },
  { to: "/estudio", label: "Estúdio de Provas & Cases", icon: Award, iconColor: "text-purple-400" },
  { to: "/administracao", label: "Administração / Ajustes", icon: Settings, iconColor: "text-slate-400" },
];

const candidatoModules: ModuleItem[] = [
  { to: "/vagas", label: "Microsite de Vagas", icon: Briefcase, iconColor: "text-blue-400" },
  { to: "/minhas-candidaturas", label: "Minhas Candidaturas", icon: FileCheck2, iconColor: "text-emerald-400" },
];

const candidatoPaths = candidatoModules.map((m) => m.to);

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full text-left text-xs font-bold px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition cursor-pointer border-l-4 ${
    isActive
      ? "bg-slate-800 text-white border-blue-500"
      : "text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-white"
  }`;

export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authDisabled, loading: authLoading, session } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // On mobile the sidebar becomes a fixed slide-in drawer; on desktop it is a
  // static column. Tracked via matchMedia so the drawer styles apply inline.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // The active role is derived from the current route.
  const role: "recrutador" | "candidato" = candidatoPaths.includes(location.pathname)
    ? "candidato"
    : "recrutador";

  // ── Shared portal state (moved from the old App monolith) ──
  const [vagas, setVagas] = useState<Vaga[]>(initialVagas);
  const [candidatos, setCandidatos] = useState<Candidato[]>(initialCandidatos);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(initialVagas[0]);
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(initialCandidatos[0]);
  const [appliedMap, setAppliedMap] = useState<Record<string, string[]>>({
    cand_1: ["vaga_senai_1"],
    cand_2: ["vaga_sesi_1"],
    cand_3: ["vaga_iel_1"],
    cand_4: ["vaga_fiesc_1"],
    cand_5: ["vaga_senai_2"],
  });

  const handleSelectVaga = (vaga: Vaga) => setSelectedVaga(vaga);
  const handleSelectCandidato = (candidato: Candidato) => setSelectedCandidato(candidato);

  const handleAddVaga = (data: Omit<Vaga, "id" | "dataCriacao">) => {
    const newVaga: Vaga = {
      ...data,
      id: `vaga_${Date.now()}`,
      dataCriacao: new Date().toISOString().split("T")[0],
    };
    setVagas((prev) => [newVaga, ...prev]);
    setSelectedVaga(newVaga);
  };

  const handleAddCandidato = (data: Omit<Candidato, "id" | "dataCandidatura">) => {
    const newCand: Candidato = {
      ...data,
      id: `cand_${Date.now()}`,
      dataCandidatura: new Date().toISOString().split("T")[0],
    };
    setCandidatos((prev) => [newCand, ...prev]);
    setSelectedCandidato(newCand);
  };

  const handleApply = (vagaId: string, candidatoId: string) => {
    setAppliedMap((prev) => ({
      ...prev,
      [candidatoId]: Array.from(new Set([...(prev[candidatoId] || []), vagaId])),
    }));
  };

  const portal: PortalContextValue = {
    vagas, candidatos, selectedVaga, selectedCandidato, appliedMap,
    setSelectedVaga, setSelectedCandidato,
    handleSelectVaga, handleSelectCandidato, handleAddVaga, handleAddCandidato, handleApply,
  };

  const modules = role === "recrutador" ? recrutadorModules : candidatoModules;

  const goTo = (to: string) => {
    navigate(to);
    setSidebarOpen(false);
  };

  // Inline drawer positioning wins over any Tailwind cascade quirks.
  const drawerStyle: CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s ease",
      }
    : {};

  // Gate de login (Supabase). Inativo enquanto o Supabase não está configurado,
  // então a demo segue acessível. Sem ProtectedRoute: o próprio layout do portal
  // é o ponto único de verificação para todas as rotas internas.
  if (!authDisabled) {
    if (authLoading) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-300 text-sm">
          Carregando sessão…
        </div>
      );
    }
    if (!session) {
      return <Navigate to="/login" replace />;
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-800" id="main_app_wrapper">

      {/* Top status bar (full width) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-2 px-4 text-xs shrink-0">
        <div className="flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="md:hidden text-slate-300 hover:text-white cursor-pointer shrink-0"
              aria-label="Alternar menu"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="truncate">HOMOLOGADO SISTEMA FIESC (SST / BENNER INTEGRADO)</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="hidden sm:inline">Ambiente: <strong>Homologação</strong></span>
            <span className="hidden sm:inline">Região: <strong>Santa Catarina</strong></span>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Página inicial
            </button>
          </div>
        </div>
      </div>

      {/* Body: fixed sidebar + scrollable content */}
      <div className="flex flex-1 min-h-0 relative">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR (fixed on desktop, slide-in drawer on mobile) */}
        <aside
          style={drawerStyle}
          className="bg-slate-900 text-slate-200 border-r border-slate-800 p-4 w-64 shrink-0 flex flex-col justify-between overflow-y-auto"
        >
          <div className="space-y-6">
            {/* Role toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso de Painel</label>
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
                <button
                  onClick={() => goTo("/console")}
                  className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "recrutador" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Recrutador
                </button>
                <button
                  onClick={() => goTo("/vagas")}
                  className={`flex-1 text-[11px] font-bold py-2 px-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === "candidato" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Candidato
                </button>
              </div>
            </div>

            {/* Module navigation */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 mb-1">
                {role === "recrutador" ? "Módulos Recrutador" : "Portal do Candidato"}
              </span>
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <NavLink key={m.to} to={m.to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                    <Icon className={`w-4 h-4 ${m.iconColor}`} />
                    {m.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Legal/ethics credit */}
          <div className="pt-8 border-t border-slate-800 text-[10px] text-slate-500 space-y-1.5">
            <p className="font-semibold">✓ Conexão Benner Ativa</p>
            <p>Este sistema respeita rigorosamente a LGPD e o princípio da não-discriminação profissional.</p>
          </div>
        </aside>

        {/* WORKSPACE (full width, own scroll) */}
        <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet context={portal} />
          </div>

          <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 mt-auto">
            <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <span>&copy; 2026 Sistema FIESC - Federação das Indústrias do Estado de Santa Catarina.</span>
              <div className="flex items-center gap-6">
                <span className="hover:text-white transition">LGPD: Lei 13.709/2018</span>
                <span>•</span>
                <span className="hover:text-white transition">R&amp;S Integrado da Indústria</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
