"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { toastCustom } from "@/components/ui/custom/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { dashboardConfig } from "@/config/dashboard";

interface SessionState {
  isActive: boolean;
  lastActivity: number;
  expiresAt: number;
  warningShown: boolean;
  countdownActive: boolean;
}

/**
 * Componente para gerenciar sessão do usuário
 * Monitora inatividade, expirações e renova tokens automaticamente
 */
export function SessionManager() {
  const { isAuthenticated, logout, refreshToken } = useAuth();
  const router = useRouter();

  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: true,
    lastActivity: Date.now(),
    expiresAt: 0,
    warningShown: false,
    countdownActive: false,
  });

  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);

  /**
   * Atualizar última atividade
   */
  const updateActivity = useCallback(() => {
    setSessionState((prev) => ({
      ...prev,
      lastActivity: Date.now(),
      isActive: true,
      warningShown: false,
    }));

    // Salvar no localStorage para sincronizar entre abas
    localStorage.setItem("lastActivity", Date.now().toString());
  }, []);

  /**
   * Verificar se sessão está próxima do vencimento
   */
  const checkTokenExpiration = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = tokenData.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      setSessionState((prev) => ({ ...prev, expiresAt: expirationTime }));

      // Se expira em menos de 5 minutos, mostrar aviso
      if (
        timeUntilExpiry < dashboardConfig.sessionWarningThreshold &&
        timeUntilExpiry > 0 &&
        !sessionState.warningShown
      ) {
        setShowExpirationWarning(true);
        setCountdown(Math.floor(timeUntilExpiry / 1000));
        setSessionState((prev) => ({
          ...prev,
          warningShown: true,
          countdownActive: true,
        }));
      }

      // Se já expirou, fazer logout
      if (timeUntilExpiry <= 0) {
        handleSessionExpired();
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error);
    }
  }, [sessionState.warningShown]);

  /**
   * Verificar inatividade
   */
  const checkInactivity = useCallback(() => {
    const timeSinceLastActivity = Date.now() - sessionState.lastActivity;

    if (timeSinceLastActivity > dashboardConfig.inactivityTimeout) {
      handleInactivityTimeout();
    }
  }, [sessionState.lastActivity]);

  /**
   * Lidar com timeout de inatividade
   */
  const handleInactivityTimeout = useCallback(() => {
    toastCustom.warning({
      title: "Sessão Inativa",
      description: "Você foi desconectado por inatividade.",
      duration: 5000,
    });

    logout();
    router.push("/auth/login?reason=inactivity");
  }, [logout, router]);

  /**
   * Lidar com expiração de sessão
   */
  const handleSessionExpired = useCallback(() => {
    setShowExpirationWarning(false);

    toastCustom.error({
      title: "Sessão Expirada",
      description: "Sua sessão expirou. Faça login novamente.",
      duration: 5000,
    });

    logout();
    router.push("/auth/login?reason=expired");
  }, [logout, router]);

  /**
   * Renovar sessão
   */
  const handleRenewSession = useCallback(async () => {
    try {
      await refreshToken();

      setShowExpirationWarning(false);
      setSessionState((prev) => ({
        ...prev,
        warningShown: false,
        countdownActive: false,
      }));

      toastCustom.success({
        title: "Sessão Renovada",
        description: "Sua sessão foi renovada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      handleSessionExpired();
    }
  }, [refreshToken, handleSessionExpired]);

  /**
   * Monitorar atividade do usuário
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Throttle para evitar muitas atualizações
    let throttleTimeout: NodeJS.Timeout;
    const throttledUpdateActivity = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        updateActivity();
        clearTimeout(throttleTimeout);
      }, 1000);
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledUpdateActivity, {
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledUpdateActivity);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [isAuthenticated, updateActivity]);

  /**
   * Verificações periódicas
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkTokenExpiration();
      checkInactivity();
    }, 60000); // Verificar a cada minuto

    // Verificação inicial
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiration, checkInactivity]);

  /**
   * Countdown do aviso de expiração
   */
  useEffect(() => {
    if (!sessionState.countdownActive || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, sessionState.countdownActive]);

  /**
   * Sincronizar atividade entre abas
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lastActivity" && e.newValue) {
        const lastActivity = parseInt(e.newValue);
        setSessionState((prev) => ({ ...prev, lastActivity }));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /**
   * Detectar quando a aba fica visível/invisível
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Aba ficou visível, verificar se precisa renovar
        updateActivity();
        checkTokenExpiration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [updateActivity, checkTokenExpiration]);

  // Não renderizar se não está autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Modal de aviso de expiração */}
      <Dialog open={showExpirationWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" closeButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-600"
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
              <span>Sessão Expirando</span>
            </DialogTitle>
            <DialogDescription>
              Sua sessão expirará em{" "}
              <strong>
                {Math.max(0, Math.floor(countdown / 60))}:
                {String(countdown % 60).padStart(2, "0")}
              </strong>{" "}
              minutos.
              <br />
              Deseja renovar sua sessão?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleSessionExpired}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Fazer Logout
            </Button>
            <Button
              onClick={handleRenewSession}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Renovar Sessão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Indicador de sessão ativa (desenvolvimento) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 p-2 bg-black/80 text-white text-xs rounded font-mono">
          <div>Sessão: {sessionState.isActive ? "Ativa" : "Inativa"}</div>
          <div>
            Última atividade:{" "}
            {new Date(sessionState.lastActivity).toLocaleTimeString()}
          </div>
          {sessionState.expiresAt > 0 && (
            <div>
              Expira em:{" "}
              {Math.max(
                0,
                Math.floor((sessionState.expiresAt - Date.now()) / 1000 / 60)
              )}
              min
            </div>
          )}
        </div>
      )}
    </>
  );
}
