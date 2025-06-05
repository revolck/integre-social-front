/**
 * Configurações da API
 * Endpoints, autenticação e serviços
 */

// Configuração base da API
export const apiConfig = {
  // URL base da API principal
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.integreapp.com/v1",

  // Timeout padrão para requisições
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),

  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000, // ms
    backoff: 2, // multiplicador para backoff exponencial
  },

  // Headers padrão
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-API-Version": "v1",
  },

  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    perWindow: 60 * 1000, // 1 minuto
  },
} as const;

// Configuração dos microsserviços
export const microservicesConfig = {
  // Serviço de autenticação
  auth: {
    baseURL:
      process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || `${apiConfig.baseURL}/auth`,
    endpoints: {
      login: "/login",
      logout: "/logout",
      refresh: "/refresh",
      register: "/register",
      verify: "/verify",
      resetPassword: "/reset-password",
      changePassword: "/change-password",
      profile: "/profile",
    },
  },

  // Serviço de usuários
  users: {
    baseURL:
      process.env.NEXT_PUBLIC_USERS_SERVICE_URL || `${apiConfig.baseURL}/users`,
    endpoints: {
      list: "/",
      create: "/",
      get: "/:id",
      update: "/:id",
      delete: "/:id",
      permissions: "/:id/permissions",
      roles: "/roles",
    },
  },

  // Serviço de organizações/tenants
  organizations: {
    baseURL:
      process.env.NEXT_PUBLIC_ORGS_SERVICE_URL ||
      `${apiConfig.baseURL}/organizations`,
    endpoints: {
      list: "/",
      create: "/",
      get: "/:id",
      update: "/:id",
      delete: "/:id",
      members: "/:id/members",
      settings: "/:id/settings",
    },
  },

  // Serviço de beneficiados
  beneficiaries: {
    baseURL:
      process.env.NEXT_PUBLIC_BENEFICIARIES_SERVICE_URL ||
      `${apiConfig.baseURL}/beneficiaries`,
    endpoints: {
      list: "/",
      create: "/",
      get: "/:id",
      update: "/:id",
      delete: "/:id",
      services: "/:id/services",
      history: "/:id/history",
      documents: "/:id/documents",
    },
  },

  // Serviço financeiro
  financial: {
    baseURL:
      process.env.NEXT_PUBLIC_FINANCIAL_SERVICE_URL ||
      `${apiConfig.baseURL}/financial`,
    endpoints: {
      transactions: "/transactions",
      invoices: "/invoices",
      payments: "/payments",
      reports: "/reports",
      budgets: "/budgets",
    },
  },

  // Serviço de analytics
  analytics: {
    baseURL:
      process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL ||
      `${apiConfig.baseURL}/analytics`,
    endpoints: {
      dashboard: "/dashboard",
      reports: "/reports",
      metrics: "/metrics",
      charts: "/charts",
      export: "/export",
    },
  },

  // Serviço de notificações
  notifications: {
    baseURL:
      process.env.NEXT_PUBLIC_NOTIFICATIONS_SERVICE_URL ||
      `${apiConfig.baseURL}/notifications`,
    endpoints: {
      list: "/",
      send: "/send",
      markRead: "/:id/read",
      preferences: "/preferences",
      templates: "/templates",
    },
  },

  // Serviço de upload de arquivos
  files: {
    baseURL:
      process.env.NEXT_PUBLIC_FILES_SERVICE_URL || `${apiConfig.baseURL}/files`,
    endpoints: {
      upload: "/upload",
      download: "/download/:id",
      delete: "/:id",
      list: "/",
    },
    maxSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"), // 10MB
    allowedTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES?.split(",") || [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
} as const;

// Configuração do WebSocket
export const websocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || "wss://ws.integreapp.com",
  reconnectAttempts: 5,
  reconnectDelay: 3000,
  heartbeatInterval: 30000,
  maxReconnectDelay: 30000,

  // Eventos do WebSocket
  events: {
    connect: "connect",
    disconnect: "disconnect",
    error: "error",
    notification: "notification",
    userUpdate: "user:update",
    organizationUpdate: "organization:update",
    beneficiaryUpdate: "beneficiary:update",
  },
} as const;

// Configuração de cache
export const cacheConfig = {
  // TTL padrão em milissegundos
  defaultTTL: parseInt(process.env.CACHE_TTL || "300000"), // 5 minutos
  longTTL: 60 * 60 * 1000, // 1 hora
  shortTTL: 30 * 1000, // 30 segundos

  // Máximo de itens no cache
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || "1000"),

  // Chaves de cache
  keys: {
    user: "user:",
    organization: "org:",
    permissions: "perms:",
    settings: "settings:",
    analytics: "analytics:",
  },
} as const;

/**
 * Constrói URL completa do endpoint
 */
export function buildEndpointURL(
  service: keyof typeof microservicesConfig,
  endpoint: string,
  params: Record<string, string | number> = {}
): string {
  const serviceConfig = microservicesConfig[service];
  let url = `${serviceConfig.baseURL}${endpoint}`;

  // Substituir parâmetros na URL
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });

  return url;
}

/**
 * Verifica se o serviço está habilitado
 */
export function isServiceEnabled(
  service: keyof typeof microservicesConfig
): boolean {
  // Em desenvolvimento, todos os serviços estão habilitados
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // Em produção, verificar variáveis de ambiente específicas
  const envVar = `NEXT_PUBLIC_${service.toUpperCase()}_SERVICE_ENABLED`;
  return process.env[envVar] !== "false";
}
