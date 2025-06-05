"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { DashboardSidebar, DashboardHeader } from "@/theme";
import { LoadingScreen } from "@/components/layout/loading/loading-screen";
import { SessionManager } from "@/components/layout/session/SessionManager";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/providers/auth-provider";
import { useApp } from "@/providers/app-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { useSecurity } from "@/hooks/use-security";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { dashboardConfig } from "@/config/dashboard";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout principal do dashboard
 *
 * Funcionalidades:
 * - Autenticação obrigatória
 * - Verificação de permissões por rota
 * - Gestão de sessão automática
 * - Layout responsivo
 * - Sidebar e header dinâmicos
 * - Notificações centralizadas
 * - Monitoramento de segurança
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  // Contexts
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    organization,
    isFeatureEnabled,
  } = useApp();

  // Hooks
  const { canAccessRoute } = usePermissions();
  const { securityState, performSecurityCheck } = useSecurity();

  // Estados locais
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [routePermissionCheck, setRoutePermissionCheck] = useState<{
    allowed: boolean;
    reason?: string;
  }>({ allowed: true });

  /**
   * Verificar permissões da rota atual
   */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const permission = canAccessRoute(pathname);
    setRoutePermissionCheck(permission);

    if (!permission.allowed) {
      console.warn(`Acesso negado para ${pathname}:`, permission.reason);

      // Redirecionar para página de não autorizado
      router.replace("/dashboard/unauthorized");
    }
  }, [pathname, isAuthenticated, user, canAccessRoute, router]);

  /**
   * Verificações de segurança periódicas
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Verificação inicial
    performSecurityCheck();

    // Verificações periódicas
    const interval = setInterval(
      performSecurityCheck,
      dashboardConfig.sessionRefreshThreshold
    );

    return () => clearInterval(interval);
  }, [isAuthenticated, performSecurityCheck]);

  /**
   * Gestão responsiva do sidebar
   */
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, sidebarCollapsed, setSidebarCollapsed]);

  /**
   * Fechar menu mobile quando navegar
   */
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname, setMobileMenuOpen]);

  /**
   * Toggle sidebar
   */
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [
    isMobile,
    mobileMenuOpen,
    sidebarCollapsed,
    setMobileMenuOpen,
    setSidebarCollapsed,
  ]);

  /**
   * Detectar inatividade e alertar sobre expiração da sessão
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);

      // Aviso 2 minutos antes de expirar
      warningTimer = setTimeout(() => {
        // Mostrar modal de aviso de expiração
        console.warn("Sessão expirará em breve");
      }, dashboardConfig.inactivityTimeout - dashboardConfig.sessionWarningThreshold);

      // Logout automático
      inactivityTimer = setTimeout(() => {
        console.warn("Sessão expirada por inatividade");
        router.push("/auth/logout?reason=inactivity");
      }, dashboardConfig.inactivityTimeout);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimers, { passive: true });
    });

    // Iniciar timers
    resetTimers();

    return () => {
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimers);
      });
    };
  }, [isAuthenticated, router]);

  /**
   * Inicialização do layout
   */
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      organization &&
      routePermissionCheck.allowed
    ) {
      setIsLayoutReady(true);
    }
  }, [isAuthenticated, user, organization, routePermissionCheck.allowed]);

  /**
   * Loading inicial
   */
  if (isLoading || !isLayoutReady) {
    return (
      <LoadingScreen
        message="Carregando dashboard..."
        subMessage="Preparando seu ambiente de trabalho"
      />
    );
  }

  /**
   * Verificação de violações de segurança críticas
   */
  if (!securityState.isSecure) {
    const criticalViolations = securityState.violations.filter(
      (v) => v.severity === "critical"
    );

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
            Sessão Comprometida
          </h1>
          <p className="text-gray-600 mb-4">
            Detectamos atividade suspeita em sua conta.
            {criticalViolations.length > 0 &&
              ` (${criticalViolations[0].details})`}
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <PermissionGuard
        requiredPermissions={["dashboard:read"]}
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-gray-600">
                Você não tem permissão para acessar o dashboard.
              </p>
            </div>
          </div>
        }
      >
        {/* Container principal do dashboard */}
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar */}
          <DashboardSidebar
            isMobileMenuOpen={mobileMenuOpen}
            setIsMobileMenuOpen={setMobileMenuOpen}
            isCollapsed={sidebarCollapsed}
          />

          {/* Área principal */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <DashboardHeader
              collapsed={sidebarCollapsed}
              toggleCollapse={toggleSidebar}
            />

            {/* Conteúdo principal */}
            <main
              className={cn(
                "flex-1 overflow-auto bg-[var(--background-body)] transition-all duration-300",
                "focus:outline-none"
              )}
              tabIndex={-1}
            >
              {/* Container do conteúdo com padding */}
              <div className="container mx-auto p-6 max-w-7xl">
                {/* Breadcrumb ou título da página */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {getPageTitle(pathname)}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        {organization?.name}
                      </p>
                    </div>

                    {/* Indicador de conectividade */}
                    <div className="flex items-center space-x-2">
                      {securityState.isRateLimited && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Rate Limited
                        </div>
                      )}

                      {!navigator.onLine && (
                        <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          Offline
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo da página */}
                <div className="space-y-6">{children}</div>
              </div>
            </main>
          </div>
        </div>

        {/* Componentes globais */}
        <SessionManager />
        <NotificationCenter />
      </PermissionGuard>
    </AuthGuard>
  );
}

/**
 * Obter título da página baseado na rota
 */
function getPageTitle(pathname: string): string {
  const routes: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/overview": "Visão Geral",
    "/dashboard/users": "Usuários",
    "/dashboard/beneficiados": "Beneficiados",
    "/dashboard/financial": "Financeiro",
    "/dashboard/analytics": "Analytics",
    "/dashboard/reports": "Relatórios",
    "/dashboard/settings": "Configurações",
  };

  return routes[pathname] || "Dashboard";
}
