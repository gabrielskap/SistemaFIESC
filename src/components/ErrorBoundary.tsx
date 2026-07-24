import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Captura erros de render de qualquer componente abaixo dele, evitando que a
 * árvore inteira "apague" (tela branca). Mostra um fallback amigável e permite
 * recarregar. Error boundaries precisam ser classes (não há equivalente em hooks).
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleReload = () => {
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
          <h1 className="text-lg font-bold text-slate-900">Algo deu errado</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ocorreu um erro inesperado na interface. Você pode recarregar e tentar novamente.
          </p>
          {this.state.message && (
            <p className="text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2 break-words text-left">
              {this.state.message}
            </p>
          )}
          <button
            onClick={this.handleReload}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg cursor-pointer transition"
          >
            Recarregar aplicação
          </button>
        </div>
      </div>
    );
  }
}
