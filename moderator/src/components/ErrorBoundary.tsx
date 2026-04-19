import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center">
          <h1 className="text-xl font-semibold text-amber-400">Nešto je pošlo naopako</h1>
          <p className="max-w-md text-slate-400">
            Osvežite stranicu. Ako se greška ponovi, proverite konzolu ili kontaktirajte podršku.
          </p>
          {this.state.message ? (
            <pre className="max-w-lg overflow-auto rounded border border-slate-700 bg-slate-900 p-3 text-left text-xs text-slate-500">
              {this.state.message}
            </pre>
          ) : null}
          <button
            type="button"
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400"
            onClick={() => window.location.reload()}
          >
            Osveži
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
