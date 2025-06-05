"use client";

import React, { useMemo } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuth } from "@/providers/auth-provider";
import { useApp } from "@/providers/app-provider";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredAnyPermissions?: string[];
  requiredRole?: string[];
  requireFeature?: string;
  requireResourceOwnership?: {
    resourceOwnerId: string;
    allowIfAdmin?: boolean;
  };
  requireOrganization?: string;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
  hideWhenNoPermission?: boolean;
  showPermissionError?: boolean;
  onPermissionDenied?: (reason: string) => void;
}

/**
 * Guard de permissões que controla acesso baseado em papéis e permissões
 * Suporta verificações complexas de autorização
 */
export function PermissionGuard({
  children,
  requiredPermissions = [],
  requiredAnyPermissions = [],
  requiredRole = [],
  requireFeature,
  requireResourceOwnership,
  requireOrganization,
  allowedRoles = [],
  fallback,
  hideWhenNoPermission = false,
  showPermissionError = true,
  onPermissionDenied,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const { organization, isFeatureEnabled } = useApp();
  const {
    hasAllPermissions,
    hasAnyPermission,
    isResourceOwner,
    hasOrganizationPermission,
    isAdmin,
    userRole,
  } = usePermissions();

  /**
   * Verificar todas as condições de permissão
   */
  const permissionCheck = useMemo(() => {
    if (!user) {
      return {
        allowed: false,
        reason: "Usuário não autenticado",
      };
    }

    // Verificar permissões específicas (todas devem ser atendidas)
    if (requiredPermissions.length > 0) {
      const result = hasAllPermissions(requiredPermissions);
      if (!result.allowed) {
        return result;
      }
    }

    // Verificar permissões alternativas (pelo menos uma deve ser atendida)
    if (requiredAnyPermissions.length > 0) {
      const result = hasAnyPermission(requiredAnyPermissions);
      if (!result.allowed) {
        return result;
      }
    }

    // Verificar roles específicos
    if (requiredRole.length > 0) {
      const hasRequiredRole = requiredRole.includes(userRole || "");
      if (!hasRequiredRole) {
        return {
          allowed: false,
          reason: `Role requerido: ${requiredRole.join(
            " ou "
          )}. Atual: ${userRole}`,
        };
      }
    }

    // Verificar roles permitidos
    if (allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.includes(userRole || "");
      if (!hasAllowedRole) {
        return {
          allowed: false,
          reason: `Role não permitido: ${userRole}`,
        };
      }
    }

    // Verificar feature flag
    if (requireFeature) {
      if (!isFeatureEnabled(requireFeature)) {
        return {
          allowed: false,
          reason: `Feature '${requireFeature}' não está habilitada`,
        };
      }
    }

    // Verificar propriedade do recurso
    if (requireResourceOwnership) {
      const { resourceOwnerId, allowIfAdmin = true } = requireResourceOwnership;

      const isOwner = isResourceOwner(resourceOwnerId);
      const canBypassAsAdmin = allowIfAdmin && isAdmin;

      if (!isOwner && !canBypassAsAdmin) {
        return {
          allowed: false,
          reason: "Você não tem permissão para acessar este recurso",
        };
      }
    }

    // Verificar organização específica
    if (requireOrganization) {
      if (!organization || organization.id !== requireOrganization) {
        return {
          allowed: false,
          reason: "Organização incorreta para este recurso",
        };
      }
    }

    // Verificar permissões organizacionais
    if (requiredPermissions.length > 0 && organization) {
      for (const permission of requiredPermissions) {
        const result = hasOrganizationPermission(permission, organization.id);
        if (!result.allowed) {
          return result;
        }
      }
    }

    // Todas as verificações passaram
    return { allowed: true };
  }, [
    user,
    requiredPermissions,
    requiredAnyPermissions,
    requiredRole,
    allowedRoles,
    requireFeature,
    requireResourceOwnership,
    requireOrganization,
    hasAllPermissions,
    hasAnyPermission,
    isResourceOwner,
    hasOrganizationPermission,
    isAdmin,
    userRole,
    organization,
    isFeatureEnabled,
  ]);

  // Chamar callback se permissão negada
  React.useEffect(() => {
    if (
      !permissionCheck.allowed &&
      onPermissionDenied &&
      permissionCheck.reason
    ) {
      onPermissionDenied(permissionCheck.reason);
    }
  }, [permissionCheck.allowed, permissionCheck.reason, onPermissionDenied]);

  // Se não tem permissão
  if (!permissionCheck.allowed) {
    // Esconder completamente se configurado
    if (hideWhenNoPermission) {
      return null;
    }

    // Usar fallback customizado se fornecido
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar erro de permissão se configurado
    if (showPermissionError) {
      return (
        <div className="p-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 mb-4">
              {permissionCheck.reason ||
                "Você não tem permissão para acessar este conteúdo."}
            </p>

            {/* Informações de debug em desenvolvimento */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 p-3 bg-gray-50 rounded text-left text-xs">
                <summary className="cursor-pointer font-medium">
                  Debug de Permissões
                </summary>
                <div className="mt-2 space-y-1">
                  <div>
                    <strong>Usuário:</strong> {user?.name} ({userRole})
                  </div>
                  <div>
                    <strong>Organização:</strong> {organization?.name}
                  </div>
                  <div>
                    <strong>Permissões Requeridas:</strong>{" "}
                    {requiredPermissions.join(", ") || "Nenhuma"}
                  </div>
                  <div>
                    <strong>Permissões Alternativas:</strong>{" "}
                    {requiredAnyPermissions.join(", ") || "Nenhuma"}
                  </div>
                  <div>
                    <strong>Roles Requeridos:</strong>{" "}
                    {requiredRole.join(", ") || "Nenhum"}
                  </div>
                  <div>
                    <strong>Feature Requerida:</strong>{" "}
                    {requireFeature || "Nenhuma"}
                  </div>
                  <div>
                    <strong>Razão da Negação:</strong> {permissionCheck.reason}
                  </div>
                </div>
              </details>
            )}

            <button
              onClick={() => window.history.back()}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Voltar
            </button>
          </div>
        </div>
      );
    }

    // Não mostrar nada por padrão
    return null;
  }

  // Renderizar children se tem permissão
  return <>{children}</>;
}

/**
 * Hook para verificar permissões condicionalmente
 */
export function usePermissionGuard(permissions: string[]) {
  const { hasAllPermissions } = usePermissions();

  return useMemo(() => {
    return hasAllPermissions(permissions);
  }, [permissions, hasAllPermissions]);
}

/**
 * Componente HOC para proteger componentes com permissões
 */
export function withPermissions<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: string[],
  fallbackComponent?: React.ComponentType<P>
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasAllPermissions } = usePermissions();
    const permissionResult = hasAllPermissions(requiredPermissions);

    if (!permissionResult.allowed) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
