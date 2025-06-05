"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { containsMaliciousContent } from "@/config/security";

interface SecurityState {
  isSecure: boolean;
  lastSecurityCheck: Date | null;
  violations: SecurityViolation[];
  isRateLimited: boolean;
}

interface SecurityViolation {
  type:
    | "xss"
    | "injection"
    | "rate_limit"
    | "unauthorized"
    | "suspicious_activity";
  timestamp: Date;
  details: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface RateLimitState {
  requests: number;
  windowStart: number;
  isLimited: boolean;
}

/**
 * Hook para gerenciar segurança da aplicação
 */
export function useSecurity() {
  const { user, logout } = useAuth();
  const [securityState, setSecurityState] = useState<SecurityState>({
    isSecure: true,
    lastSecurityCheck: null,
    violations: [],
    isRateLimited: false,
  });

  const [rateLimitStates] = useState(new Map<string, RateLimitState>());

  /**
   * Adicionar violação de segurança
   */
  const addViolation = useCallback(
    (violation: Omit<SecurityViolation, "timestamp">) => {
      const newViolation: SecurityViolation = {
        ...violation,
        timestamp: new Date(),
      };

      setSecurityState((prev) => ({
        ...prev,
        violations: [...prev.violations, newViolation],
        isSecure: violation.severity !== "critical",
      }));

      // Log da violação
      console.warn("Violação de segurança detectada:", newViolation);

      // Em caso crítico, fazer logout
      if (violation.severity === "critical") {
        logout();
      }
    },
    [logout]
  );

  /**
   * Verificar rate limiting
   */
  const checkRateLimit = useCallback(
    (
      endpoint: string,
      maxRequests: number = 100,
      windowMs: number = 15 * 60 * 1000
    ): boolean => {
      const now = Date.now();
      const key = `${user?.id || "anonymous"}-${endpoint}`;

      let state = rateLimitStates.get(key);

      if (!state || now - state.windowStart > windowMs) {
        // Nova janela de tempo
        state = {
          requests: 1,
          windowStart: now,
          isLimited: false,
        };
      } else {
        // Incrementar contador na janela atual
        state.requests++;
      }

      // Verificar se excedeu o limite
      if (state.requests > maxRequests) {
        state.isLimited = true;

        addViolation({
          type: "rate_limit",
          details: `Rate limit excedido para ${endpoint}: ${state.requests}/${maxRequests}`,
          severity: "medium",
        });

        setSecurityState((prev) => ({ ...prev, isRateLimited: true }));
      }

      rateLimitStates.set(key, state);
      return !state.isLimited;
    },
    [user?.id, rateLimitStates, addViolation]
  );

  /**
   * Validar input contra XSS e injection
   */
  const validateInput = useCallback(
    (input: string, context: string = "general"): boolean => {
      if (containsMaliciousContent(input)) {
        addViolation({
          type: "xss",
          details: `Conteúdo malicioso detectado em ${context}: ${input.substring(
            0,
            100
          )}`,
          severity: "high",
        });
        return false;
      }

      // Verificar padrões de SQL injection
      const sqlPatterns = [
        /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
        /(--|\/\*|\*\/)/,
        /(\b(or|and)\s+\d+\s*=\s*\d+)/i,
      ];

      const hasSqlInjection = sqlPatterns.some((pattern) =>
        pattern.test(input)
      );
      if (hasSqlInjection) {
        addViolation({
          type: "injection",
          details: `Tentativa de SQL injection em ${context}: ${input.substring(
            0,
            100
          )}`,
          severity: "critical",
        });
        return false;
      }

      return true;
    },
    [addViolation]
  );

  /**
   * Monitorar atividade suspeita
   */
  const monitorActivity = useCallback(() => {
    const suspicious = {
      rapidClicks: 0,
      rapidRequests: 0,
      lastActivity: Date.now(),
    };

    let clickCount = 0;
    let requestCount = 0;

    const clickHandler = () => {
      clickCount++;

      // Reset contador após 1 segundo
      setTimeout(() => {
        if (clickCount > 20) {
          addViolation({
            type: "suspicious_activity",
            details: `Cliques excessivos detectados: ${clickCount} cliques em 1 segundo`,
            severity: "medium",
          });
        }
        clickCount = 0;
      }, 1000);
    };

    document.addEventListener("click", clickHandler);

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [addViolation]);

  /**
   * Verificar integridade da sessão
   */
  const checkSessionIntegrity = useCallback(async () => {
    try {
      if (!user) return true;

      const token = localStorage.getItem("accessToken");
      if (!token) return false;

      // Verificar se o token não foi modificado
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        addViolation({
          type: "unauthorized",
          details: "Token JWT inválido detectado",
          severity: "critical",
        });
        return false;
      }

      // Verificar timestamp da última atividade
      const lastActivity = localStorage.getItem("lastActivity");
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        const maxInactivity = 30 * 60 * 1000; // 30 minutos

        if (timeSinceLastActivity > maxInactivity) {
          addViolation({
            type: "unauthorized",
            details: "Sessão inativa por muito tempo",
            severity: "medium",
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro na verificação de integridade:", error);
      return false;
    }
  }, [user, addViolation]);

  /**
   * Atualizar timestamp de atividade
   */
  const updateActivity = useCallback(() => {
    localStorage.setItem("lastActivity", Date.now().toString());
  }, []);

  /**
   * Limpar violações antigas
   */
  const clearOldViolations = useCallback(() => {
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    const now = Date.now();

    setSecurityState((prev) => ({
      ...prev,
      violations: prev.violations.filter(
        (violation) => now - violation.timestamp.getTime() < maxAge
      ),
    }));
  }, []);

  /**
   * Realizar verificação de segurança completa
   */
  const performSecurityCheck = useCallback(async () => {
    const isSessionValid = await checkSessionIntegrity();

    setSecurityState((prev) => ({
      ...prev,
      isSecure:
        isSessionValid &&
        prev.violations.filter((v) => v.severity === "critical").length === 0,
      lastSecurityCheck: new Date(),
    }));

    clearOldViolations();
  }, [checkSessionIntegrity, clearOldViolations]);

  // Verificação de segurança inicial e periódica
  useEffect(() => {
    performSecurityCheck();

    // Verificação a cada 5 minutos
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [performSecurityCheck]);

  // Monitorar atividade do usuário
  useEffect(() => {
    const cleanup = monitorActivity();
    return cleanup;
  }, [monitorActivity]);

  // Atualizar atividade em eventos
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [updateActivity]);

  return {
    securityState,
    checkRateLimit,
    validateInput,
    addViolation,
    performSecurityCheck,
    updateActivity,
  };
}
