import { useEffect, useState } from "react";
import {
  Settings, Save, AlertTriangle, SlidersHorizontal, MessageSquareText, ShieldCheck, RefreshCw,
} from "lucide-react";
import { useConfig, type PesosPadrao, type TemplatesMensagem } from "../data/useConfig";
import { useAuth } from "../auth/authContext";

const RECOMENDACAO_LABEL: Record<keyof TemplatesMensagem, string> = {
  avancar: "Avançar no processo",
  revisar_manual: "Revisão manual",
  nao_recomendado: "Não recomendado",
};

export default function AdminPage() {
  const { pesos, templates, loading, configured, error, save } = useConfig();
  const { role } = useAuth();
  const canEdit = configured && role === "admin";

  const [formPesos, setFormPesos] = useState<PesosPadrao>(pesos);
  const [formTemplates, setFormTemplates] = useState<TemplatesMensagem>(templates);
  const [savingPesos, setSavingPesos] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  // Sincroniza o formulário quando a config chega/atualiza do banco.
  useEffect(() => setFormPesos(pesos), [pesos]);
  useEffect(() => setFormTemplates(templates), [templates]);

  const setPesoField = (field: keyof PesosPadrao, value: number) =>
    setFormPesos((prev) => ({ ...prev, [field]: value }));

  const savePesos = async () => {
    setSavingPesos(true);
    setFeedback(null);
    const err = await save("pesos_padrao", formPesos);
    setSavingPesos(false);
    setFeedback(err ? { kind: "err", msg: err } : { kind: "ok", msg: "Regras de pontuação salvas." });
  };

  const saveTemplates = async () => {
    setSavingTemplates(true);
    setFeedback(null);
    const err = await save("templates_mensagem", formTemplates);
    setSavingTemplates(false);
    setFeedback(err ? { kind: "err", msg: err } : { kind: "ok", msg: "Templates de mensagem salvos." });
  };

  const numberField = (
    label: string,
    field: keyof PesosPadrao,
    hint: string,
    min: number,
    max: number
  ) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        disabled={!canEdit}
        value={formPesos[field]}
        onChange={(e) => setPesoField(field, Number(e.target.value))}
        className="w-full text-sm px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
      />
      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{hint}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-700" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Administração / Ajustes</h3>
        {loading && <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />}
      </div>

      {/* Banner de estado (demo / permissão) */}
      {!configured ? (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Modo demonstração.</strong> Configure o Supabase (<code>.env</code>) para persistir e editar
            estas configurações. Os valores abaixo são os padrões do sistema.
          </span>
        </div>
      ) : !canEdit ? (
        <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 leading-relaxed">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Somente administradores podem editar. Você está em modo leitura.</span>
        </div>
      ) : null}

      {error && (
        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</div>
      )}
      {feedback && (
        <div
          className={`text-xs rounded-lg p-3 border ${
            feedback.kind === "ok"
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : "text-rose-700 bg-rose-50 border-rose-200"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regras de pontuação (consumidas por computeWeightedScore no servidor) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <SlidersHorizontal className="w-5 h-5 text-blue-700" />
            <h4 className="text-sm font-bold text-slate-800">Regras de Pontuação da Triagem</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Aplicadas em toda avaliação (individual e em lote). O score é determinístico no servidor; a IA só
            gera a devolutiva textual.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {numberField("Limiar “Avançar” (%)", "limiar_avancar", "Score ≥ este valor → recomenda avançar.", 0, 100)}
            {numberField("Limiar “Não recomendado” (%)", "limiar_nao_recomendado", "Score < este valor → não recomendado.", 0, 100)}
            {numberField("Multiplicador obrigatórios", "multiplicador_obrigatorio", "Peso extra dos requisitos obrigatórios.", 1, 5)}
          </div>

          <button
            onClick={savePesos}
            disabled={!canEdit || savingPesos}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {savingPesos ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar regras
          </button>
        </div>

        {/* Templates de mensagem (consumidos pelo /api/generate-message mock) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquareText className="w-5 h-5 text-indigo-700" />
            <h4 className="text-sm font-bold text-slate-800">Templates de Comunicação</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Corpo padrão das mensagens ao candidato por recomendação (usado quando a IA generativa está
            desligada).
          </p>

          <div className="space-y-3">
            {(Object.keys(RECOMENDACAO_LABEL) as (keyof TemplatesMensagem)[]).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                  {RECOMENDACAO_LABEL[key]}
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  value={formTemplates[key]}
                  onChange={(e) => setFormTemplates((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveTemplates}
            disabled={!canEdit || savingTemplates}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            {savingTemplates ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar templates
          </button>
        </div>
      </div>

      {/* Nota factual sobre auditoria/LGPD (substitui os logs fictícios antigos) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">
        <span className="font-bold text-slate-700 block mb-1">Trilha de auditoria</span>
        Ações sensíveis (triagens, correções, geração de mensagens e provas) são registradas em
        <code className="mx-1">audit_logs</code>
        no servidor via service-role, para fins de auditoria interna e conformidade (LGPD — Lei 13.709/2018).
      </div>
    </div>
  );
}
