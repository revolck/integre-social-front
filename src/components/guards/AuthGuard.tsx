"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { LoadingScreen } from "@/components/layout/loading/loading-screen";
import { authConfig } from "@/config/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowUnauthenticated?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  requireEmailVerification?: boolean;
  requireMFA?: boolean;
}

/**
 * Guard de autenticação que protege rotas
 * Verifica se o usuário está autenticado e redireciona conforme necessário
 */
export function AuthGuard({
  children,
  allowUnauthenticated = false,
  redirectTo,
  fallback,
  requireEmailVerification = false,
  requireMFA = false,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        // Aguardar a verificação de auth terminar
        if (isLoading) {
          return;
        }

        // Se permite não autenticados, liberar acesso
        if (allowUnauthenticated) {
          if (isMounted) {
            setIsCheckingAuth(false);
          }
          return;
        }

        // Verificar se está autenticado
        if (!isAuthenticated || !user) {
          const loginUrl = redirectTo || authConfig.redirects.afterSignOut;
          const returnUrl = encodeURIComponent(pathname);

          // Salvar URL de retorno para após o login
          localStorage.setItem("returnUrl", pathname);

          // Redirecionar para login
          router.replace(`${loginUrl}?returnUrl=${returnUrl}`);
          return;
        }

        // Verificações adicionais se autenticado
        if (user) {
          // Verificar se email está verificado (se requerido)
          if (requireEmailVerification && !user.isEmailVerified) {
            setAuthError("Email não verificado");
            router.replace("/auth/verify-email");
            return;
          }

          // Verificar MFA (se requerido)
          if (requireMFA && !user.mfaEnabled) {
            setAuthError("Autenticação de dois fatores requerida");
            router.replace("/auth/setup-mfa");
            return;
          }

          // Verificar se a sessão não expirou
          const token = localStorage.getItem("accessToken");
          if (token) {
            try {
              const tokenData = JSON.parse(atob(token.split(".")[1]));
              const expirationTime = tokenData.exp * 1000;
              const currentTime = Date.now();

              // Se o token expira em menos de 5 minutos, tentar refresh
              if (expirationTime - currentTime < 5 * 60 * 1000) {
                // Token próximo do vencimento - será tratado pelo AuthProvider
                console.info(
                  "Token próximo do vencimento, refresh será feito automaticamente"
                );
              }

              // Se já expirou, redirecionar para login
              if (expirationTime < currentTime) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                router.replace("/auth/login?reason=expired");
                return;
              }
            } catch (error) {
              // Token inválido
              console.error("Token inválido:", error);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              router.replace("/auth/login?reason=invalid");
              return;
            }
          }

          // Verificar se o usuário ainda tem acesso à organização atual
          if (user.organizationId) {
            const storedOrgId = localStorage.getItem("organizationId");
            if (storedOrgId && storedOrgId !== user.organizationId) {
              // Organização mudou, atualizar
              localStorage.setItem("organizationId", user.organizationId);
            }
          }
        }

        // Todas as verificações passaram
        if (isMounted) {
          setIsCheckingAuth(false);
          setAuthError(null);
        }
      } catch (error) {
        console.error("Erro na verificação de autenticação:", error);

        if (isMounted) {
          setAuthError("Erro na verificação de autenticação");
          setIsCheckingAuth(false);
        }

        // Em caso de erro, redirecionar para login
        if (!allowUnauthenticated) {
          router.replace("/auth/login?reason=error");
        }
      }
    };

    checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, [
    isLoading,
    isAuthenticated,
    user,
    allowUnauthenticated,
    requireEmailVerification,
    requireMFA,
    pathname,
    router,
    redirectTo,
  ]);

  // Mostrar loading enquanto verifica auth
  if (isLoading || isCheckingAuth) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <LoadingScreen
        message="Verificando autenticação..."
        subMessage="Aguarde enquanto validamos suas credenciais"
      />
    );
  }

  // Mostrar erro se houver
  if (authError) {
    return (
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
            Erro de Autenticação
          </h1>
          <p className="text-gray-600 mb-4">{authError}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não permite não autenticados, mostrar fallback ou nada
  if (!isAuthenticated && !allowUnauthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return null;
  }

  // Renderizar children se tudo está OK
  return <>{children}</>;
}
