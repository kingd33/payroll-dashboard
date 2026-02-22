import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 font-mono text-sm max-w-4xl mx-auto mt-20 rounded-xl border border-red-200">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">⚠️ React Render Crash</h1>
          <p className="mb-4 text-red-700">The application crashed during render. Stack trace below:</p>
          <pre className="bg-red-900/10 p-4 rounded overflow-auto border border-red-900/20 shadow-inner">
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
