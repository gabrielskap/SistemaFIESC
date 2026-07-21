import { Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 animate-fadeIn">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Settings className="w-5 h-5 text-slate-700" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Painel de Administração ATS</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="font-extrabold text-slate-800 block">Conexão Benner ERP / Folha</span>
            <p>O sincronismo com os módulos de recrutamento Benner está atualmente operando em modo Sandbox local.</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-extrabold text-slate-800 block">Princípio de Isenção Algorítmica</span>
            <p>As diretrizes éticas estão configuradas como <strong>Ativas e Inegociáveis</strong>. O sistema filtra automaticamente referências diretas de gênero, idade limite, credo, etnia e filiação sindical.</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">Auditoria de Logs FIESC</span>
          <p className="text-[11px]">Todos os acessos e processos seletivos são rastreáveis para fins de auditoria do Ministério Público do Trabalho e auditorias internas do conselho FIESC.</p>

          <div className="text-[10px] font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg">
            • LOG_BENNER_REST: OK<br />
            • AUDIT_LGPD_SEC_OK: 100%<br />
            • TOKEN_OAUTH_EXPIRES: 2026-12-31
          </div>
        </div>
      </div>
    </div>
  );
}
