import React from "react";
import { useNavigate } from "react-router-dom";
import fiescLogo from "../assets/logos/fiesc.png";
import sesiLogo from "../assets/logos/sesi.png";
import senaiLogo from "../assets/logos/senai.png";
import ielLogo from "../assets/logos/iel.png";

/** Gradient text helper (clipped background on transparent text). */
const gradientText = (gradient: string): React.CSSProperties => ({
  background: gradient,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

const eyebrow: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  margin: "0 0 12px",
};

/** Small square glyph used inside the colored icon tiles. */
const Glyph = ({ size = 12 }: { size?: number }) => (
  <span style={{ width: size, height: size, borderRadius: 3, background: "#fff" }} />
);

const principios = [
  { titulo: "1. Conformidade LGPD", texto: "Dados pessoais e contatos mascarados por segurança.", grad: "linear-gradient(135deg,#10b981,#059669)", sombra: "rgba(16,185,129,0.55)" },
  { titulo: "2. Não-Discriminação", texto: "Avaliação isenta de raça, gênero, idade ou estado civil.", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", sombra: "rgba(59,130,246,0.55)" },
  { titulo: "3. Transparência", texto: "Toda nota acompanha justificativa técnica objetiva.", grad: "linear-gradient(135deg,#f59e0b,#d97706)", sombra: "rgba(245,158,11,0.55)" },
  { titulo: "4. Análise Estanque", texto: "Isolamento total de dados entre processos seletivos.", grad: "linear-gradient(135deg,#a855f7,#7c3aed)", sombra: "rgba(168,85,247,0.55)" },
  { titulo: "5. Decisão Humana", texto: "A IA sugere score e ranking; a palavra final é sua.", grad: "linear-gradient(135deg,#f43f5e,#e11d48)", sombra: "rgba(244,63,94,0.55)" },
];

const etapas = [
  { n: "01", titulo: "Publicação da vaga", texto: "Recrutador cadastra requisitos obrigatórios e desejáveis, com pesos definidos para cada critério.", grad: "linear-gradient(135deg,#2563eb,#60a5fa)", sombra: "rgba(37,99,235,0.35)" },
  { n: "02", titulo: "Triagem pela IA", texto: "O copiloto mascara dados sensíveis e aplica os critérios técnicos definidos, sem viés.", grad: "linear-gradient(135deg,#10b981,#34d399)", sombra: "rgba(16,185,129,0.35)" },
  { n: "03", titulo: "Parecer transparente", texto: "Cada candidato recebe um score de aderência e uma justificativa técnica objetiva.", grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", sombra: "rgba(245,158,11,0.35)" },
  { n: "04", titulo: "Decisão humana", texto: "Recrutador e banca avaliam o ranking sugerido e tomam a decisão final do processo.", grad: "linear-gradient(135deg,#a855f7,#c084fc)", sombra: "rgba(168,85,247,0.35)" },
];

const modulos = [
  { titulo: "Console / Dashboard", texto: "Visão consolidada de vagas ativas, candidatos em processo e indicadores de cada seleção.", grad: "linear-gradient(135deg,#2563eb,#60a5fa)", sombra: "rgba(37,99,235,0.6)" },
  { titulo: "Processos (Kanban)", texto: "Acompanhamento visual de cada candidato pelas etapas do processo seletivo, do início à contratação.", grad: "linear-gradient(135deg,#10b981,#34d399)", sombra: "rgba(16,185,129,0.6)" },
  { titulo: "Triagem Inteligente IA", texto: "Avaliação individual ou em lote, com ranking automático por aderência técnica aos requisitos da vaga.", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", sombra: "rgba(124,58,237,0.6)" },
  { titulo: "Estúdio de Provas & Cases", texto: "Elaboração de testes técnicos e correção assistida por IA a partir de rubricas de pontuação.", grad: "linear-gradient(135deg,#f59e0b,#f472b6)", sombra: "rgba(245,158,11,0.6)" },
];

const faqs = [
  { p: "A inteligência artificial decide quem é aprovado?", r: "Não. A IA calcula score e ranking com base nos critérios definidos pelo recrutador, mas a decisão final de avançar ou não um candidato é sempre humana." },
  { p: "Como os dados dos candidatos são protegidos?", r: "Dados pessoais e contatos são mascarados durante a análise técnica, em conformidade com a LGPD (Lei 13.709/2018)." },
  { p: "A plataforma atende as quatro entidades ao mesmo tempo?", r: "Sim. FIESC, SESI, SENAI e IEL operam na mesma plataforma, com isolamento total de dados entre processos seletivos de cada entidade." },
  { p: "O sistema se integra ao Benner e a outros sistemas já em uso?", r: "Sim, a integração é feita via REST/OAuth2 com o ERP Benner, mantendo o fluxo de dados de folha e RH sincronizado." },
  { p: "É possível auditar as avaliações feitas pela IA?", r: "Sim. Todos os acessos e pareceres são registrados e rastreáveis, para auditoria interna ou de órgãos como o Ministério Público do Trabalho." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "#1e293b", fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* TOP UTILITY BAR */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", color: "#94a3b8", padding: "10px 24px", fontSize: 12, fontFamily: "'SF Mono', ui-monospace, monospace" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#818cf8", animation: "pulse-soft 2s ease-in-out infinite" }} />
            <span>Plataforma homologada do Sistema FIESC</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span>Região: <strong style={{ color: "#cbd5e1" }}>Santa Catarina</strong></span>
            <button
              onClick={() => navigate("/console")}
              style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "none", color: "#fff", fontWeight: 700, fontSize: 12, padding: "8px 15px", borderRadius: 7, fontFamily: "'Inter', system-ui, sans-serif", cursor: "pointer" }}
            >
              Acesso ao Painel do Recrutador
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <header style={{ position: "relative", background: "#0b0f1e", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -160, left: -120, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.55),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -220, right: -140, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.5),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "20%", right: "12%", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.28),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "76px 24px 0" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap", alignItems: "center" }}>
            <img src={fiescLogo} alt="FIESC" style={{ height: 30, width: "auto", borderRadius: 4, display: "block" }} />
            <img src={sesiLogo} alt="SESI" style={{ height: 46, width: "auto", borderRadius: 4, display: "block" }} />
            <img src={senaiLogo} alt="SENAI" style={{ height: 30, width: "auto", borderRadius: 4, display: "block" }} />
            <img src={ielLogo} alt="IEL" style={{ height: 30, width: "auto", borderRadius: 4, display: "block" }} />
          </div>

          <div className="lp-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 56, alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#60a5fa,#a78bfa)" }} />
                Recrutamento e Seleção · Sistema S de Santa Catarina
              </p>
              <h1 className="lp-hero-title" style={{ fontSize: 60, lineHeight: 1.05, fontWeight: 900, margin: "0 0 22px", letterSpacing: "-0.025em" }}>
                <span>ATS Sistema FIESC</span><br />
                <span style={gradientText("linear-gradient(100deg,#60a5fa 10%,#a78bfa 55%,#f472b6 90%)")}>Copiloto de Recrutamento</span>
              </h1>
              <p style={{ fontSize: 20, lineHeight: 1.55, color: "#cbd5e1", maxWidth: 560, margin: "0 0 38px" }}>
                Uma plataforma única para recrutadores, gestores e bancas avaliadoras conduzirem processos seletivos éticos e tecnicamente rigorosos para toda a indústria catarinense.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button onClick={() => navigate("/console")} style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "16px 30px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 12px 32px -8px rgba(124,58,237,0.65)" }}>
                  Solicitar demonstração
                </button>
                <a href="#modulos" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid #334155", color: "#e2e8f0", fontWeight: 600, fontSize: 16, padding: "16px 30px", borderRadius: 12, display: "inline-block" }}>
                  Conhecer os módulos
                </a>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.06)", padding: 18, borderRadius: 14, border: "1px solid rgba(148,163,184,0.25)", backdropFilter: "blur(6px)" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#f59e0b,#f472b6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: "#fff", animation: "pulse-soft 2s ease-in-out infinite" }} />
                </span>
                <div>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#f8fafc" }}>IA Inteligente Ativa</span>
                  <span style={{ display: "block", fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Baseada em modelos Gemini 3.5</span>
                </div>
              </div>
              <div style={{ background: "linear-gradient(160deg,rgba(37,99,235,0.18),rgba(124,58,237,0.14))", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 16, padding: 22, aspectRatio: "4/3", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 10, textAlign: "center" }}>
                <div style={{ width: "100%", height: "100%", border: "1px dashed rgba(148,163,184,0.4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#c7d2fe", fontSize: 13, fontFamily: "ui-monospace, monospace" }}>
                  screenshot do painel · dashboard do recrutador
                </div>
              </div>
            </div>
          </div>

          {/* PRINCIPLES STRIP */}
          <div className="lp-principles" style={{ marginTop: 58, padding: "28px 0 44px", borderTop: "1px solid rgba(148,163,184,0.18)", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
            {principios.map((item) => (
              <div key={item.titulo} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: item.grad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 16px -4px ${item.sombra}` }}>
                  <Glyph />
                </span>
                <div>
                  <h4 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{item.titulo}</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* COMO FUNCIONA */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto 64px", textAlign: "center" }}>
          <p style={{ ...eyebrow, ...gradientText("linear-gradient(100deg,#2563eb,#7c3aed)") }}>Como funciona</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.01em", color: "#0f172a" }}>Do cadastro da vaga à decisão final</h2>
          <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.6, margin: 0 }}>Quatro etapas guiam cada processo seletivo, do requisito técnico à recomendação — sempre com a palavra final humana.</p>
        </div>

        <div className="lp-steps" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {etapas.map((item) => (
            <div key={item.n} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: "30px 26px", boxShadow: `0 20px 40px -28px ${item.sombra}` }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, fontSize: 16, fontWeight: 800, color: "#fff", background: item.grad, borderRadius: 12, marginBottom: 20 }}>{item.n}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px", color: "#0f172a" }}>{item.titulo}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MÓDULOS */}
      <section id="modulos" style={{ position: "relative", background: "#0f172a", padding: "120px 24px", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -180, left: "50%", transform: "translateX(-50%)", width: 900, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.28),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ maxWidth: 640, margin: "0 auto 64px", textAlign: "center" }}>
            <p style={{ ...eyebrow, ...gradientText("linear-gradient(100deg,#60a5fa,#c084fc)") }}>Módulos do sistema</p>
            <h2 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.01em", color: "#fff" }}>Um único ambiente para toda a seleção</h2>
            <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>Dashboard, fluxo de candidatos, triagem inteligente e elaboração de provas — tudo integrado para as quatro entidades.</p>
          </div>

          <div className="lp-modules" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 24 }}>
            {modulos.map((item) => (
              <div key={item.titulo} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 18, padding: 32, display: "flex", gap: 20, backdropFilter: "blur(6px)" }}>
                <span style={{ width: 52, height: 52, borderRadius: 14, background: item.grad, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 24px -8px ${item.sombra}` }}>
                  <Glyph size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 10px", color: "#fff" }}>{item.titulo}</h3>
                  <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{item.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 840, margin: "0 auto", padding: "120px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ ...eyebrow, ...gradientText("linear-gradient(100deg,#2563eb,#7c3aed)") }}>Perguntas frequentes</p>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: "-0.01em", color: "#0f172a" }}>O que gestores perguntam antes de adotar</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {faqs.map((item) => (
            <div key={item.p} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "26px 28px", boxShadow: "0 12px 28px -22px rgba(15,23,42,0.4)" }}>
              <h4 style={{ fontSize: 16.5, fontWeight: 700, margin: "0 0 8px", color: "#0f172a" }}>{item.p}</h4>
              <p style={{ fontSize: 14.5, color: "#64748b", lineHeight: 1.6, margin: 0 }}>{item.r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="contato" style={{ position: "relative", background: "linear-gradient(135deg,#0f172a,#1e1b4b 55%,#0f172a)", color: "#fff", padding: "110px 24px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -140, left: "20%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.4),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -160, right: "15%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,0.35),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 18px", letterSpacing: "-0.01em" }}>Pronto para modernizar o recrutamento do Sistema FIESC?</h2>
          <p style={{ fontSize: 17, color: "#cbd5e1", lineHeight: 1.6, margin: "0 0 36px" }}>Fale com o time responsável pela plataforma e conheça o ATS em uma demonstração para sua entidade.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/console")} style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff", fontWeight: 700, fontSize: 16, padding: "16px 30px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 14px 34px -10px rgba(124,58,237,0.7)" }}>
              Solicitar demonstração
            </button>
            <button onClick={() => navigate("/vagas")} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(148,163,184,0.3)", color: "#e2e8f0", fontWeight: 600, fontSize: 16, padding: "16px 30px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>
              Portal do Candidato
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0b0f1e", borderTop: "1px solid #1e293b", color: "#94a3b8", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
          <span>© 2026 Sistema FIESC — Federação das Indústrias do Estado de Santa Catarina.</span>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <span>LGPD: Lei 13.709/2018</span>
            <span>R&amp;S Integrado da Indústria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
