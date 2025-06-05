"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { systemConfig } from "@/config/system";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  eventId?: string;
}

/**
 * Error Boundary para capturar erros não tratados
 * Implementa logging, recuperação automática e fallbacks
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Gerar ID único para o erro
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Atualizar estado com informações completas do erro
    this.setState({ errorInfo });

    // Log detalhado do erro
    const errorDetails = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
    };

    console.error("ErrorBoundary capturou um erro:", errorDetails);

    // Chamar callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar erro para serviços de monitoramento em produção
    if (process.env.NODE_ENV === "production") {
      this.reportError(errorDetails);
    }

    // Auto-reset após 30 segundos (opcional)
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 30000);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && resetKeys.length > 0) {
        // Reset se as chaves mudaram
        this.resetErrorBoundary();
      }
    }

    if (
      hasError &&
      resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      // Reset se os children mudaram
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  /**
   * Obter ID do usuário para contexto do erro
   */
  private getUserId(): string | null {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignorar erros ao obter user ID
    }
    return null;
  }

  /**
   * Obter ID da sessão para contexto do erro
   */
  private getSessionId(): string | null {
    try {
      return localStorage.getItem("sessionId");
    } catch {
      return null;
    }
  }

  /**
   * Reportar erro para serviços de monitoramento
   */
  private async reportError(errorDetails: any) {
    try {
      // Enviar para Sentry, LogRocket, ou serviço próprio
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Implementar envio para Sentry
        console.log("Enviando erro para Sentry:", errorDetails);
      }

      // Enviar para API própria
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorDetails),
      });
    } catch (reportingError) {
      console.error("Erro ao reportar erro:", reportingError);
    }
  }

  /**
   * Resetar o error boundary
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
      eventId: undefined,
    });

    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
  };

  /**
   * Determinar tipo de erro para mostrar UI apropriada
   */
  private getErrorType(): "chunk" | "network" | "permission" | "generic" {
    const { error } = this.state;

    if (!error) return "generic";

    if (
      error.message.includes("ChunkLoadError") ||
      error.message.includes("Loading chunk")
    ) {
      return "chunk";
    }

    if (
      error.message.includes("Network") ||
      error.message.includes("Failed to fetch")
    ) {
      return "network";
    }

    if (
      error.message.includes("Permission") ||
      error.message.includes("Unauthorized")
    ) {
      return "permission";
    }

    return "generic";
  }

  /**
   * Renderizar UI específica para cada tipo de erro
   */
  private renderErrorUI() {
    const { hasError, error, errorId } = this.state;
    const errorType = this.getErrorType();

    if (!hasError) {
      return this.props.children;
    }

    // Se foi fornecido um fallback customizado
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const errorMessages = {
      chunk: {
        title: "Falha no Carregamento",
        description:
          "Houve um problema ao carregar parte da aplicação. Isso pode acontecer após uma atualização.",
        action: "Recarregar Página",
        handler: () => window.location.reload(),
      },
      network: {
        title: "Problema de Conexão",
        description:
          "Não foi possível conectar com nossos servidores. Verifique sua conexão com a internet.",
        action: "Tentar Novamente",
        handler: this.resetErrorBoundary,
      },
      permission: {
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar este recurso.",
        action: "Voltar",
        handler: () => window.history.back(),
      },
      generic: {
        title: "Oops! Algo deu errado",
        description:
          "Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.",
        action: "Tentar Novamente",
        handler: this.resetErrorBoundary,
      },
    };

    const { title, description, action, handler } = errorMessages[errorType];

    return (
      <div className="flex h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                {title}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">{description}</p>

              {errorId && (
                <p className="text-xs text-gray-400 font-mono">
                  ID do erro: {errorId}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handler} className="w-full sm:w-auto">
                  {action}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/")}
                  className="w-full sm:w-auto"
                >
                  Ir para Início
                </Button>
              </div>

              {/* Botões adicionais para desenvolvimento */}
              {process.env.NODE_ENV === "development" && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer font-medium text-sm">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                    <strong>Erro:</strong> {error?.message}
                    {error?.stack && (
                      <>
                        <br />
                        <br />
                        <strong>Stack:</strong>
                        <br />
                        {error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer com informações de contato */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            Se o problema persistir, entre em contato com{" "}
            <a
              href="/suporte"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              nosso suporte
            </a>
          </p>
          <p className="mt-1">
            {systemConfig.name} - Versão {systemConfig.version || "1.0.0"}
          </p>
        </div>
      </div>
    );
  }

  render() {
    // Se isolate estiver habilitado, renderizar em um container isolado
    if (this.props.isolate && this.state.hasError) {
      return <div style={{ isolation: "isolate" }}>{this.renderErrorUI()}</div>;
    }

    return this.renderErrorUI();
  }
}

/**
 * Hook para usar ErrorBoundary programaticamente
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error("Erro capturado via hook:", error, errorInfo);

    // Em produção, reportar para serviços de monitoramento
    if (process.env.NODE_ENV === "production") {
      // Implementar reporting
    }
  };
}
