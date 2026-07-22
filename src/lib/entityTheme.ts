import { Entidade } from "../types";

/**
 * Single source of truth for entity colors, labels and specialties.
 *
 * Previously `getEntityStyle` was copy-pasted in 5 components with TWO
 * conflicting color maps (e.g. SENAI was amber in most screens but red in
 * VagasList), so the same job showed different colors depending on the screen.
 *
 * Colors here follow the Sistema S brand associations:
 *   SENAI → red · SESI → blue · IEL → green(emerald) · FIESC → navy(slate)
 *
 * NOTE: keep these as complete literal class strings so Tailwind's content
 * scanner keeps them in the build. Do not build class names by concatenation.
 */
export interface EntityTheme {
  /** Short label, e.g. "SENAI". */
  label: string;
  /** One-line description of the entity's focus (was getEntitySpecialty). */
  specialty: string;
  /** Soft pill: background + text + border. Used by most badges. */
  pill: string;
  /** Stronger badge: background + text. */
  badge: string;
  /** Selected-card border + ring. */
  borderSelected: string;
  /** Solid accent background. */
  accentBg: string;
  /** Accent text color. */
  accentText: string;
}

const THEME: Record<Entidade, EntityTheme> = {
  SENAI: {
    label: "SENAI",
    specialty: "Educação profissional, docente e inovação tecnológica.",
    pill: "bg-red-50 text-red-700 border-red-200",
    badge: "bg-red-100 text-red-800",
    borderSelected: "border-red-500 ring-2 ring-red-100",
    accentBg: "bg-red-600",
    accentText: "text-red-600",
  },
  SESI: {
    label: "SESI",
    specialty: "Saúde ocupacional, segurança do trabalho e educação básica.",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    borderSelected: "border-blue-500 ring-2 ring-blue-100",
    accentBg: "bg-blue-600",
    accentText: "text-blue-600",
  },
  IEL: {
    label: "IEL",
    specialty: "Estágio, Jovem Aprendiz e desenvolvimento de carreira.",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800",
    borderSelected: "border-emerald-500 ring-2 ring-emerald-100",
    accentBg: "bg-emerald-600",
    accentText: "text-emerald-600",
  },
  FIESC: {
    label: "FIESC",
    specialty: "Representação de mercado e rotinas institucionais da indústria.",
    pill: "bg-slate-100 text-slate-700 border-slate-300",
    badge: "bg-slate-200 text-slate-800",
    borderSelected: "border-slate-800 ring-2 ring-slate-100",
    accentBg: "bg-slate-800",
    accentText: "text-slate-800",
  },
};

const DEFAULT_THEME: EntityTheme = {
  label: "—",
  specialty: "Entidade do Sistema FIESC.",
  pill: "bg-slate-50 text-slate-600 border-slate-200",
  badge: "bg-slate-100 text-slate-700",
  borderSelected: "border-slate-400 ring-2 ring-slate-100",
  accentBg: "bg-slate-600",
  accentText: "text-slate-600",
};

/** Full theme for an entity (safe for unknown/legacy values). */
export function entityTheme(entidade: Entidade | string): EntityTheme {
  return THEME[entidade as Entidade] ?? DEFAULT_THEME;
}

/** Convenience: just the soft pill classes (bg + text + border). */
export function entityPill(entidade: Entidade | string): string {
  return entityTheme(entidade).pill;
}
