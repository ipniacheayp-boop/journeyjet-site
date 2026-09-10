import React, { Component, ErrorInfo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  constructor(props: Props & { navigate: (path: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
          <div className="max-w-xl text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground">
              An unexpected error interrupted this page. You can retry or return to the homepage.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                Reload page
              </button>
              <button
                type="button"
                onClick={() => this.props.navigate("/")}
                className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition"
              >
                Go to homepage
              </button>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

// Wrapper to use hooks with class component
export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  return <ErrorBoundaryClass navigate={navigate}>{children}</ErrorBoundaryClass>;
};
