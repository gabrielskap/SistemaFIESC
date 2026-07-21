import { Sparkles } from "lucide-react";
import EstudioAvaliacoes from "../components/EstudioAvaliacoes";
import { usePortal } from "../portal/portalContext";

export default function EstudioPage() {
  const { selectedVaga, selectedCandidato } = usePortal();
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">Assistente Inteligente de Exames & Integridade FIESC</h4>
          <p className="text-xs text-indigo-800 leading-relaxed">
            Automatize a elaboração de testes objetivos/cases para o <strong>SENAI, SESI, IEL ou FIESC</strong>. Em seguida, utilize o Corretor de Respostas baseado nas rubricas de pontuação e valide a integridade do processo analisando plágios ou cola automática de IA sem julgamentos precipitados.
          </p>
        </div>
      </div>

      <EstudioAvaliacoes vaga={selectedVaga} candidato={selectedCandidato} />
    </div>
  );
}
