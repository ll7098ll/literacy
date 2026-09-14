import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public componentDidMount() {
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleGlobalPromiseRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleGlobalPromiseRejection);
  }

  private handleGlobalError = (event: ErrorEvent) => {
    this.setState({ hasError: true, error: event.error || new Error(event.message) });
  };

  private handleGlobalPromiseRejection = (event: PromiseRejectionEvent) => {
    this.setState({ hasError: true, error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)) });
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unknown error occurred';
      let errorDetails = null;

      try {
        // Try to parse Firestore error info
        const parsed = JSON.parse(errorMessage);
        if (parsed.error && parsed.operationType) {
          errorMessage = `Firestore Error (${parsed.operationType}): ${parsed.error}`;
          errorDetails = parsed;
        }
      } catch (e) {
        // Not a JSON error string, ignore
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-slate-600 mb-6">{errorMessage}</p>
            
            {errorDetails && (
              <div className="bg-slate-50 p-4 rounded-lg text-xs font-mono text-slate-500 overflow-auto mb-6">
                <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
