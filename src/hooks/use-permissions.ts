"use client";

import { useMemo, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useApp } from "@/providers/app-provider";
import { UserRole, hasPermission, canAccessRoute } from "@/config/auth";

interface PermissionResult {
  allowed: boolean;
  reason?: string;
  fallbackAction?: () => void;
}

interface ComponentPermissions {
  visible: boolean;
  editable: boolean;
  deletable: boolean;
  reason?: string;
}

/**
 * Hook para gerenciar permissões granulares no sistema
 */
export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const { organization, isFeatureEnabled } = useApp();

  /**
   * Verificar se o usuário tem uma permissão específica
   */
  const hasUserPermission = useCallback(
    (permission: string): PermissionResult => {
      if (!isAuthenticated || !user) {
        return {
          allowed: false,
          reason: "Usuário não autenticado",
          fallbackAction: () => (window.location.href = "/auth/login"),
        };
      }

      if (!organization) {
        return {
          allowed: false,
          reason: "Organização não selecionada",
        };
      }

      const allowed = hasPermission(user.role, permission);

      return {
        allowed,
        reason: allowed ? undefined : "Permissão insuficiente",
      };
    },
    [isAuthenticated, user, organization]
  );

  /**
   * Verificar múltiplas permissões (AND logic)
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]): PermissionResult => {
      for (const permission of permissions) {
        const result = hasUserPermission(permission);
        if (!result.allowed) {
          return result;
        }
      }

      return { allowed: true };
    },
    [hasUserPermission]
  );

  /**
   * Verificar múltiplas permissões (OR logic)
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): PermissionResult => {
      if (permissions.length === 0) {
        return { allowed: false, reason: "Nenhuma permissão especificada" };
      }

      for (const permission of permissions) {
        const result = hasUserPermission(permission);
        if (result.allowed) {
          return result;
        }
      }

      return {
        allowed: false,
        reason: "Nenhuma das permissões necessárias encontrada",
      };
    },
    [hasUserPermission]
  );

  /**
   * Verificar acesso a uma rota específica
   */
  const canUserAccessRoute = useCallback(
    (route: string): PermissionResult => {
      if (!isAuthenticated || !user) {
        return {
          allowed: false,
          reason: "Usuário não autenticado",
          fallbackAction: () => (window.location.href = "/auth/login"),
        };
      }

      const allowed = canAccessRoute(user.role, route);

      return {
        allowed,
        reason: allowed ? undefined : `Acesso negado para a rota: ${route}`,
      };
    },
    [isAuthenticated, user]
  );

  /**
   * Verificar permissões para componentes CRUD
   */
  const getComponentPermissions = useCallback(
    (resource: string): ComponentPermissions => {
      const readResult = hasUserPermission(`${resource}:read`);
      const updateResult = hasUserPermission(`${resource}:update`);
      const deleteResult = hasUserPermission(`${resource}:delete`);

      return {
        visible: readResult.allowed,
        editable: updateResult.allowed,
        deletable: deleteResult.allowed,
        reason: !readResult.allowed ? readResult.reason : undefined,
      };
    },
    [hasUserPermission]
  );

  /**
   * Verificar se é proprietário do recurso
   */
  const isResourceOwner = useCallback(
    (resourceOwnerId: string): boolean => {
      return user?.id === resourceOwnerId;
    },
    [user?.id]
  );

  /**
   * Verificar permissão com contexto organizacional
   */
  const hasOrganizationPermission = useCallback(
    (permission: string, targetOrgId?: string): PermissionResult => {
      const basicResult = hasUserPermission(permission);

      if (!basicResult.allowed) {
        return basicResult;
      }

      // Se especificar organização alvo, verificar se é a mesma do usuário
      if (targetOrgId && targetOrgId !== organization?.id) {
        return {
          allowed: false,
          reason: "Permissão negada para organização diferente",
        };
      }

      return { allowed: true };
    },
    [hasUserPermission, organization?.id]
  );

  /**
   * Verificar permissão baseada em feature flag
   */
  const hasFeaturePermission = useCallback(
    (feature: string, permission?: string): PermissionResult => {
      if (!isFeatureEnabled(feature)) {
        return {
          allowed: false,
          reason: `Feature '${feature}' não está habilitada para esta organização`,
        };
      }

      if (permission) {
        return hasUserPermission(permission);
      }

      return { allowed: true };
    },
    [isFeatureEnabled, hasUserPermission]
  );

  /**
   * Verificar permissão temporal (horário de funcionamento)
   */
  const hasTemporalPermission = useCallback(
    (startHour: number = 0, endHour: number = 23): PermissionResult => {
      const currentHour = new Date().getHours();

      if (currentHour < startHour || currentHour > endHour) {
        return {
          allowed: false,
          reason: `Acesso permitido apenas entre ${startHour}h e ${endHour}h`,
        };
      }

      return { allowed: true };
    },
    []
  );

  /**
   * Verificar permissão baseada em quota/limite
   */
  const hasQuotaPermission = useCallback(
    (
      action: string,
      currentUsage: number,
      maxUsage: number
    ): PermissionResult => {
      if (currentUsage >= maxUsage) {
        return {
          allowed: false,
          reason: `Limite de ${action} atingido: ${currentUsage}/${maxUsage}`,
        };
      }

      return { allowed: true };
    },
    []
  );

  /**
   * Memoizar role do usuário para evitar recálculos
   */
  const userRole = useMemo(() => user?.role, [user?.role]);

  /**
   * Verificar se é admin ou super admin
   */
  const isAdmin = useMemo(() => {
    return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
  }, [userRole]);

  /**
   * Verificar se é super admin
   */
  const isSuperAdmin = useMemo(() => {
    return userRole === UserRole.SUPER_ADMIN;
  }, [userRole]);

  /**
   * Verificar se pode gerenciar usuários
   */
  const canManageUsers = useMemo(() => {
    return hasUserPermission("users:manage").allowed;
  }, [hasUserPermission]);

  /**
   * Verificar se pode ver dados financeiros
   */
  const canViewFinancial = useMemo(() => {
    return hasUserPermission("financial:read").allowed;
  }, [hasUserPermission]);

  /**
   * Verificar se pode ver relatórios
   */
  const canViewReports = useMemo(() => {
    return hasUserPermission("reports:read").allowed;
  }, [hasUserPermission]);

  /**
   * Verificar se pode gerenciar configurações
   */
  const canManageSettings = useMemo(() => {
    return hasUserPermission("settings:manage").allowed;
  }, [hasUserPermission]);

  /**
   * Função helper para proteger componentes
   */
  const withPermission = useCallback(
    (permission: string, fallbackComponent?: React.ComponentType) => {
      return (WrappedComponent: React.ComponentType<any>) => {
        return function PermissionWrapper(props: any) {
          const result = hasUserPermission(permission);

          if (!result.allowed) {
            if (fallbackComponent) {
              const FallbackComponent = fallbackComponent;
              return <FallbackComponent {...props} />;
            }
            return null;
          }

          return <WrappedComponent {...props} />;
        };
      };
    },
    [hasUserPermission]
  );

  return {
    // Verificações básicas
    hasPermission: hasUserPermission,
    hasAllPermissions,
    hasAnyPermission,
    canAccessRoute: canUserAccessRoute,

    // Verificações específicas
    getComponentPermissions,
    isResourceOwner,
    hasOrganizationPermission,
    hasFeaturePermission,
    hasTemporalPermission,
    hasQuotaPermission,

    // Roles
    userRole,
    isAdmin,
    isSuperAdmin,

    // Permissões comuns computadas
    canManageUsers,
    canViewFinancial,
    canViewReports,
    canManageSettings,

    // Utility
    withPermission,
  };
}
