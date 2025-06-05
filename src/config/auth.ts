/**
 * Configurações de autenticação e autorização
 * Implementa configurações OWASP
 */

// Tipos de usuário do sistema
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  GERENTE = "GERENTE",
  ATENDENTE = "ATENDENTE",
  BENEFICIADO = "BENEFICIADO",
  PROF_SAUDE = "PROF_SAUDE",
  RH = "RH",
  FINANCEIRO = "FINANCEIRO",
}

// Mapeamento de permissões por papel
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ["*"], // Acesso total
  [UserRole.ADMIN]: [
    "dashboard:read",
    "users:*",
    "settings:*",
    "analytics:*",
    "reports:*",
    "beneficiados:*",
    "financial:*",
  ],
  [UserRole.GERENTE]: [
    "dashboard:read",
    "users:read",
    "users:update",
    "analytics:read",
    "reports:read",
    "beneficiados:*",
    "financial:read",
  ],
  [UserRole.ATENDENTE]: [
    "dashboard:read",
    "beneficiados:read",
    "beneficiados:create",
    "beneficiados:update",
    "reports:read",
  ],
  [UserRole.BENEFICIADO]: ["profile:read", "profile:update", "services:read"],
  [UserRole.PROF_SAUDE]: [
    "dashboard:read",
    "beneficiados:read",
    "beneficiados:update",
    "health:*",
    "reports:read",
  ],
  [UserRole.RH]: [
    "dashboard:read",
    "users:read",
    "users:create",
    "users:update",
    "reports:read",
  ],
  [UserRole.FINANCEIRO]: [
    "dashboard:read",
    "financial:*",
    "reports:read",
    "analytics:read",
  ],
};

export const authConfig = {
  // Domínios autorizados para autenticação
  allowedDomains: [
    "auth.integreapp.com",
    "localhost",
    "127.0.0.1",
    ...(process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(",") || []),
  ],

  // Rate limiting para prevenção de ataques de força bruta
  rateLimit: {
    maxAttempts: parseInt(process.env.RATE_LIMIT_MAX || "5"),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000"), // 15 minutos
    blockDuration: 60 * 60 * 1000, // 1 hora de bloqueio
  },

  // Configurações de sessão seguras
  session: {
    maxAge: 24 * 60 * 60, // 24 horas
    refreshThreshold: 15 * 60, // 15 minutos antes do vencimento
    inactivityTimeout: 30 * 60 * 1000, // 30 minutos de inatividade
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },

  // Configurações de tokens JWT
  tokens: {
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || "15m",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    emailVerificationExpiry: "24h",
    passwordResetExpiry: "1h",
    secretKey: process.env.JWT_SECRET || "your-jwt-secret-here",
  },

  // Políticas de senha seguras
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 3,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    // Regex para validação de senha forte
    pattern:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },

  // Configurações OAuth
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scopes: ["openid", "email", "profile"],
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      scopes: ["openid", "email", "profile"],
    },
  },

  // URLs de redirecionamento
  redirects: {
    afterSignIn: "/dashboard/overview",
    afterSignOut: "/auth/login",
    afterSignUp: "/auth/verify-email",
    unauthorized: "/auth/unauthorized",
  },

  // Configurações de CSRF
  csrf: {
    enabled: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
  },
} as const;

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole];

  // Super admin tem acesso total
  if (permissions.includes("*")) {
    return true;
  }

  // Verifica permissão exata
  if (permissions.includes(permission)) {
    return true;
  }

  // Verifica permissão wildcard (ex: users:* para users:read)
  const [resource, action] = permission.split(":");
  if (permissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
}

/**
 * Verifica se um usuário pode acessar uma rota específica
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Mapeamento de rotas para permissões necessárias
  const routePermissions: Record<string, string[]> = {
    "/dashboard": ["dashboard:read"],
    "/dashboard/overview": ["dashboard:read"],
    "/dashboard/users": ["users:read"],
    "/dashboard/users/create": ["users:create"],
    "/dashboard/users/edit": ["users:update"],
    "/dashboard/settings": ["settings:read"],
    "/dashboard/analytics": ["analytics:read"],
    "/dashboard/beneficiados": ["beneficiados:read"],
    "/dashboard/financial": ["financial:read"],
  };

  const requiredPermissions = routePermissions[route] || [];

  return requiredPermissions.every((permission) =>
    hasPermission(userRole, permission)
  );
}
