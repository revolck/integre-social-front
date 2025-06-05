"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// Tipos para configurações da aplicação
interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
  };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  settings: AppSettings;
  plan: "free" | "basic" | "premium" | "enterprise";
  features: string[];
}

interface AppContextType {
  // Estado da aplicação
  isLoading: boolean;
  isOnline: boolean;
  organization: Organization | null;
  settings: AppSettings;

  // Funcionalidades
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;

  // Feature flags
  isFeatureEnabled: (feature: string) => boolean;

  // Cache e performance
  clearCache: () => void;
  refreshData: () => Promise<void>;

  // Estado da UI
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

// Configurações padrão
const defaultSettings: AppSettings = {
  theme: "system",
  language: "pt-BR",
  timezone: "America/Sao_Paulo",
  dateFormat: "DD/MM/YYYY",
  currency: "BRL",
  notifications: {
    email: true,
    browser: true,
    sms: false,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    reduceMotion: false,
  },
};

// Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: React.ReactNode;
  initialOrganization?: Organization;
}

export function AppProvider({
  children,
  initialOrganization,
}: AppProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(
    initialOrganization || null
  );
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Detectar status de conexão
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Status inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Carregar configurações salvas
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Carregar configurações do localStorage
        const savedSettings = localStorage.getItem("app-settings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }

        // Carregar configurações da organização se disponível
        if (organization?.id) {
          const orgSettings = localStorage.getItem(
            `org-settings-${organization.id}`
          );
          if (orgSettings) {
            const parsedOrgSettings = JSON.parse(orgSettings);
            setSettings((prev) => ({ ...prev, ...parsedOrgSettings }));
          }
        }

        // Carregar estado do sidebar
        const sidebarState = localStorage.getItem("sidebar-collapsed");
        if (sidebarState) {
          setSidebarCollapsed(JSON.parse(sidebarState));
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [organization?.id]);

  /**
   * Aplicar configurações de acessibilidade
   */
  useEffect(() => {
    const { accessibility } = settings;

    // Aplicar high contrast
    if (accessibility.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Aplicar large text
    if (accessibility.largeText) {
      document.documentElement.classList.add("large-text");
    } else {
      document.documentElement.classList.remove("large-text");
    }

    // Aplicar reduce motion
    if (accessibility.reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [settings.accessibility]);

  /**
   * Persistir estado do sidebar
   */
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  /**
   * Atualizar configurações
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);

        // Salvar no localStorage
        localStorage.setItem("app-settings", JSON.stringify(updatedSettings));

        // Se tiver organização, salvar também as configurações específicas
        if (organization?.id) {
          localStorage.setItem(
            `org-settings-${organization.id}`,
            JSON.stringify(updatedSettings)
          );

          // Chamar API para salvar no servidor
          await fetch("/api/organizations/settings", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(updatedSettings),
          });
        }
      } catch (error) {
        console.error("Erro ao atualizar configurações:", error);
        throw error;
      }
    },
    [settings, organization?.id]
  );

  /**
   * Atualizar dados da organização
   */
  const updateOrganization = useCallback(
    async (data: Partial<Organization>) => {
      try {
        if (!organization) return;

        const updatedOrganization = { ...organization, ...data };
        setOrganization(updatedOrganization);

        // Chamar API para atualizar
        await fetch(`/api/organizations/${organization.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Erro ao atualizar organização:", error);
        throw error;
      }
    },
    [organization]
  );

  /**
   * Verificar se uma feature está habilitada
   */
  const isFeatureEnabled = useCallback(
    (feature: string): boolean => {
      if (!organization) return false;

      // Verificar se a feature está na lista de features da organização
      if (organization.features.includes(feature)) {
        return true;
      }

      // Verificar features baseadas no plano
      const planFeatures: Record<string, string[]> = {
        free: ["basic_dashboard", "basic_users"],
        basic: ["basic_dashboard", "basic_users", "basic_reports"],
        premium: [
          "basic_dashboard",
          "basic_users",
          "basic_reports",
          "advanced_analytics",
          "api_access",
        ],
        enterprise: [
          "basic_dashboard",
          "basic_users",
          "basic_reports",
          "advanced_analytics",
          "api_access",
          "custom_integrations",
          "priority_support",
          "audit_logs",
        ],
      };

      return planFeatures[organization.plan]?.includes(feature) || false;
    },
    [organization]
  );

  /**
   * Limpar cache da aplicação
   */
  const clearCache = useCallback(() => {
    // Limpar localStorage exceto configurações importantes
    const itemsToKeep = ["accessToken", "refreshToken", "app-settings"];
    const allKeys = Object.keys(localStorage);

    allKeys.forEach((key) => {
      if (!itemsToKeep.includes(key) && !key.startsWith("org-settings-")) {
        localStorage.removeItem(key);
      }
    });

    // Limpar cache do service worker se disponível
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.active) {
            registration.active.postMessage({ type: "CLEAR_CACHE" });
          }
        });
      });
    }
  }, []);

  /**
   * Atualizar dados da aplicação
   */
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Recarregar dados da organização
      if (organization?.id) {
        const response = await fetch(`/api/organizations/${organization.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.ok) {
          const orgData = await response.json();
          setOrganization(orgData);
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id]);

  /**
   * Fechar menu mobile quando a tela aumentar
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  const value: AppContextType = {
    isLoading,
    isOnline,
    organization,
    settings,
    updateSettings,
    updateOrganization,
    isFeatureEnabled,
    clearCache,
    refreshData,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook para usar o contexto da aplicação
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useApp deve ser usado dentro de um AppProvider");
  }

  return context;
}
