import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { AppError, ErrorLogger, getUserFriendlyMessage } from "@/lib/errors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    if (error instanceof AppError) {
      ErrorLogger.log(error);
    } else {
      ErrorLogger.logAndParse(error, {
        resource: 'ErrorBoundary',
        action: 'componentDidCatch',
        metadata: { componentStack: errorInfo.componentStack },
      });
    }

    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error instanceof AppError
        ? getUserFriendlyMessage(this.state.error)
        : this.state.error?.message || 'Ocorreu um erro inesperado';

      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
          <Card className="max-w-2xl w-full animate-fade-in shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Desculpe, ocorreu um erro inesperado. {!isDevelopment && 'Nossa equipe foi notificada.'}
              </p>

              <div className="bg-muted p-4 rounded-md border">
                <p className="text-sm font-medium text-destructive">
                  {errorMessage}
                </p>
              </div>

              {isDevelopment && this.state.error && (
                <details className="bg-muted/50 p-4 rounded-md border text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Detalhes Técnicos (Dev Only)
                  </summary>
                  <div className="space-y-2 mt-2">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="mt-1 overflow-x-auto">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
