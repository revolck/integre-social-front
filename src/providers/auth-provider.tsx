"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { UserRole, hasPermission, canAccessRoute } from "@/config/auth";
import { toastCustom } from "@/components/ui/custom/toast";

// Tipos para o contexto de autenticação
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatar?: string;
  permissions: string[];
  lastLogin?: Date;
  isEmailVerified: boolean;
}

interface AuthContextType {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Ações
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;

  // Verificações de permissão
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;

  // Gestão de organização/tenant
  switchOrganization: (organizationId: string) => Promise<void>;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  organizationId?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  requiresVerification?: boolean;
  requiresMFA?: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Carrega o usuário do token armazenado
   */
  const loadUserFromToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verificar se o token não está expirado
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        // Token expirado, tentar refresh
        await refreshToken();
        return;
      }

      // Buscar dados do usuário
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token inválido, limpar
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Função de login
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (data.success && data.user && data.accessToken) {
          // Armazenar tokens
          localStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
          }

          // Definir usuário
          setUser(data.user);

          // Toast de sucesso
          toastCustom.success({
            title: "Login realizado com sucesso",
            description: `Bem-vindo(a), ${data.user.name}!`,
          });

          return data;
        } else {
          // Login falhou
          toastCustom.error({
            title: "Erro no login",
            description: data.error || "Credenciais inválidas",
          });

          return { success: false, error: data.error };
        }
      } catch (error) {
        console.error("Erro no login:", error);
        const errorMessage = "Erro de conexão. Tente novamente.";

        toastCustom.error({
          title: "Erro no login",
          description: errorMessage,
        });

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Função de logout
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);

      // Chamar API para invalidar token no servidor
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Limpar estado local
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("organizationId");

      // Toast de logout
      toastCustom.info({
        title: "Logout realizado",
        description: "Você foi desconectado com segurança.",
      });

      setIsLoading(false);

      // Redirecionar para login
      window.location.href = "/auth/login";
    }
  }, []);

  /**
   * Refresh do token de acesso
   */
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);

        if (data.user) {
          setUser(data.user);
        }
      } else {
        // Refresh falhou, fazer logout
        await logout();
      }
    } catch (error) {
      console.error("Erro no refresh token:", error);
      await logout();
    }
  }, [logout]);

  /**
   * Atualizar perfil do usuário
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);

        toastCustom.success({
          title: "Perfil atualizado",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toastCustom.error({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
      });
    }
  }, []);

  /**
   * Trocar organização/tenant
   */
  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/auth/switch-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem("organizationId", organizationId);

        toastCustom.success({
          title: "Organização alterada",
          description: `Agora você está trabalhando em: ${data.user.organizationName}`,
        });

        // Recarregar a página para atualizar dados específicos do tenant
        window.location.reload();
      } else {
        throw new Error("Erro ao trocar organização");
      }
    } catch (error) {
      console.error("Erro ao trocar organização:", error);
      toastCustom.error({
        title: "Erro",
        description: "Não foi possível trocar de organização.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar permissão do usuário atual
   */
  const hasUserPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  /**
   * Verificar acesso à rota
   */
  const canUserAccessRoute = useCallback(
    (route: string): boolean => {
      if (!user) return false;
      return canAccessRoute(user.role, route);
    },
    [user]
  );

  // Carregar usuário na inicialização
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Auto refresh do token
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const timeUntilExpiry = tokenData.exp * 1000 - Date.now();

        // Refresh 5 minutos antes de expirar
        if (timeUntilExpiry < 5 * 60 * 1000) {
          refreshToken();
        }
      }
    }, 60 * 1000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    updateProfile,
    hasPermission: hasUserPermission,
    canAccessRoute: canUserAccessRoute,
    switchOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
