import { Shield, Sparkles, UserCheck, Scale, EyeOff, Lock } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded tracking-widest">FIESC</span>
              <span className="bg-blue-600 text-white font-bold text-xs px-2 py-0.5 rounded tracking-widest">SESI</span>
              <span className="bg-red-500 text-white font-bold text-xs px-2 py-0.5 rounded tracking-widest">SENAI</span>
              <span className="bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded tracking-widest">IEL</span>
            </div>
            <h1 className="text-3xl font-sans font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
              ATS Sistema FIESC <span className="text-slate-500 text-lg font-normal">| Copiloto de Recrutamento</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Auxiliando recrutadores, gestores e bancas avaliadoras no recrutamento ético e técnico para a indústria catarinense.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm self-start md:self-center">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <div className="text-xs">
              <span className="block font-medium text-slate-200">IA Inteligente Ativa</span>
              <span className="text-slate-400 block mt-0.5">Baseada em modelos Gemini 3.5</span>
            </div>
          </div>
        </div>

        {/* Princípios Inegociáveis Banner */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition duration-200">
            <div className="bg-emerald-500/10 p-1.5 rounded text-emerald-400 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">1. Conformidade LGPD</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Dados pessoais e contatos mascarados por segurança.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition duration-200">
            <div className="bg-blue-500/10 p-1.5 rounded text-blue-400 mt-0.5">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">2. Não-Discriminação</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Avaliação isenta de raça, gênero, idade ou estado civil.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition duration-200">
            <div className="bg-amber-500/10 p-1.5 rounded text-amber-400 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">3. Transparência</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Toda nota acompanha justificativa técnica objetiva.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition duration-200">
            <div className="bg-purple-500/10 p-1.5 rounded text-purple-400 mt-0.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">4. Análise Estanque</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Isolamento total de dados entre processos seletivos.</p>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition duration-200">
            <div className="bg-rose-500/10 p-1.5 rounded text-rose-400 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">5. Decisão Humana</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">A IA sugere score e ranking; a palavra final é sua.</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
