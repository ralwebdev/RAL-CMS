import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              An unexpected error occurred while rendering this component.
              {this.state.error && <code className="block mt-2 p-2 bg-background rounded text-[10px] text-destructive">{this.state.error.message}</code>}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const FeatureErrorBoundary = ({ children, featureName }: { children: ReactNode, featureName: string }) => (
  <ErrorBoundary 
    fallback={
      <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-center">
        <p className="text-sm font-medium text-destructive flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Failed to load {featureName}
        </p>
        <Button 
          variant="link" 
          size="sm" 
          onClick={() => window.location.reload()}
          className="text-xs text-destructive hover:text-destructive/80"
        >
          Try again
        </Button>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
