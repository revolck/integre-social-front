"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { LoadingScreen } from "@/components/layout/loading/loading-screen";
import { useAuth } from "@/providers/auth-provider";
import { useSecurity } from "@/hooks/use-security";
import { systemConfig } from "@/config/system";
import "@/styles/globals.css";
import "@/styles/auth.css";

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout específico para páginas de autenticação
 *
 * Funcionalidades:
 * - Verificação de segurança
 * - Redirecionamento automático se já autenticado
 * - Tema otimizado para auth
 * - Rate limiting
 * - Proteções contra ataques
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { securityState, checkRateLimit } = useSecurity();

  const [isInitialized, setIsInitialized] = useState(false);
  const [securityCheck, setSecurityCheck] = useState(false);

  /**
   * Verificações de segurança na inicialização
   */
  useEffect(() => {
    const performSecurityChecks = async () => {
      try {
        // Verificar rate limiting para páginas de auth
        const isAllowed = checkRateLimit("auth_pages", 10, 60 * 1000); // 10 tentativas por minuto

        if (!isAllowed) {
          router.push("/auth/rate-limited");
          return;
        }

        // Verificar se a página está sendo acessada de um domínio autorizado
        if (typeof window !== "undefined") {
          const allowedHosts = [
            "auth.integreapp.com",
            "localhost",
            "127.0.0.1",
          ];

          const currentHost = window.location.hostname;
          const isValidHost = allowedHosts.some(
            (host) => currentHost === host || currentHost.endsWith(`.${host}`)
          );

          if (!isValidHost && process.env.NODE_ENV === "production") {
            window.location.href = `https://auth.integreapp.com${pathname}`;
            return;
          }
        }

        setSecurityCheck(true);
      } catch (error) {
        console.error("Erro na verificação de segurança:", error);
        // Em caso de erro, permitir acesso mas logar o problema
        setSecurityCheck(true);
      }
    };

    performSecurityChecks();
  }, [pathname, router, checkRateLimit]);

  /**
   * Redirecionamento se já está autenticado
   */
  useEffect(() => {
    if (!isLoading && isAuthenticated && securityCheck) {
      // Páginas que não devem redirecionar mesmo se autenticado
      const allowedWhenAuthenticated = [
        "/auth/logout",
        "/auth/profile",
        "/auth/settings",
      ];

      if (!allowedWhenAuthenticated.includes(pathname)) {
        // Redirecionar para dashboard se já estiver logado
        router.replace("/dashboard/overview");
        return;
      }
    }

    setIsInitialized(true);
  }, [isAuthenticated, isLoading, pathname, router, securityCheck]);

  /**
   * Configurar headers de segurança específicos para auth
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Adicionar classe para CSS específico de auth
      document.body.classList.add("auth-layout");

      // Configurar meta tags de segurança
      const metaCSP = document.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
      );
      if (metaCSP) {
        // Política mais restritiva para páginas de auth
        metaCSP.setAttribute(
          "content",
          "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline'; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
            "font-src 'self' https://fonts.gstatic.com; " +
            "img-src 'self' data: https:; " +
            "connect-src 'self' https://api.integreapp.com; " +
            "form-action 'self'; " +
            "frame-ancestors 'none';"
        );
      }

      return () => {
        document.body.classList.remove("auth-layout");
      };
    }
  }, []);

  /**
   * Mostrar loading enquanto inicializa
   */
  if (!securityCheck || isLoading || !isInitialized) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-background">
          <LoadingScreen
            message="Verificando segurança..."
            subMessage="Aguarde enquanto validamos sua sessão"
          />
        </div>
      </ThemeProvider>
    );
  }

  /**
   * Se há violações críticas de segurança, mostrar erro
   */
  if (!securityState.isSecure) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600 mb-4">
              Detectamos atividade suspeita. Por favor, tente novamente mais
              tarde.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      {/* Container principal do layout de auth */}
      <div className="min-h-screen bg-background auth-container">
        {/* Guard de autenticação para rotas protegidas */}
        <AuthGuard allowUnauthenticated>
          {/* Header de segurança (invisível, apenas para analytics) */}
          <div
            className="sr-only"
            data-auth-page={pathname}
            data-timestamp={Date.now()}
          >
            {systemConfig.name} - Autenticação Segura
          </div>

          {/* Conteúdo da página de auth */}
          <main className="relative z-10">{children}</main>

          {/* Footer legal (se necessário) */}
          <footer className="absolute bottom-0 left-0 right-0 p-4 text-center">
            <div className="text-xs text-muted-foreground">
              <p>
                Protegido por criptografia de ponta a ponta. Seus dados estão
                seguros conosco.
              </p>
              <div className="mt-2 space-x-4">
                <a
                  href="/termos"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Termos
                </a>
                <a
                  href="/privacidade"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacidade
                </a>
                <a
                  href="/suporte"
                  className="hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Suporte
                </a>
              </div>
            </div>
          </footer>
        </AuthGuard>
      </div>
    </ThemeProvider>
  );
}
