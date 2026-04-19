import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Storefront UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold text-neutral-900">Nešto je pošlo naopako</h1>
          <p className="max-w-md text-neutral-600">
            Osvežite stranicu. Ako se greška ponovi, proverite konzolu u pregledaču.
          </p>
          {this.state.message ? (
            <pre className="max-w-lg overflow-auto rounded border border-neutral-200 bg-white p-3 text-left text-xs text-neutral-600">
              {this.state.message}
            </pre>
          ) : null}
          <button
            type="button"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
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
