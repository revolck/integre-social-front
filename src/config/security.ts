/**
 * Headers de segurança, CSP e outras proteções
 */

/**
 * Gera Content Security Policy dinâmico baseado no ambiente
 */
export function generateCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const policies = {
    "default-src": ["'self'"],

    "script-src": [
      "'self'",
      // Em desenvolvimento, permitir eval para hot reload
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      // CDNs confiáveis
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],

    "style-src": [
      "'self'",
      "'unsafe-inline'", // Necessário para Tailwind CSS
      "https://fonts.googleapis.com",
    ],

    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:",
      // Permitir imagens de avatares e uploads
      "https://storage.integreapp.com",
      "https://avatars.githubusercontent.com",
    ],

    "font-src": ["'self'", "https://fonts.gstatic.com"],

    "connect-src": [
      "'self'",
      // APIs e WebSocket
      "https://api.integreapp.com",
      "wss://ws.integreapp.com",
      "https://www.google-analytics.com",
      // Em desenvolvimento, permitir localhost
      ...(isDev
        ? [
            "ws://localhost:*",
            "http://localhost:*",
            "https://localhost:*",
            "ws://127.0.0.1:*",
            "http://127.0.0.1:*",
            "https://127.0.0.1:*",
          ]
        : []),
    ],

    "media-src": ["'self'", "blob:", "https://storage.integreapp.com"],
    "object-src": ["'none'"],
    "child-src": ["'none'"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],

    // Prevenção de ataques de especulação
    "require-trusted-types-for": ["'script'"],
    "trusted-types": ["default"],
  };

  return Object.entries(policies)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}

/**
 * Headers de segurança obrigatórios
 */
export const securityHeaders = {
  // Previne ataques XSS
  "X-XSS-Protection": "1; mode=block",

  // Previne MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Previne clickjacking
  "X-Frame-Options": "DENY",

  // Força HTTPS
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  // Política de referrer
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Previne download de executáveis
  "X-Download-Options": "noopen",

  // Previne buffer overflow no IE
  "X-Permitted-Cross-Domain-Policies": "none",

  // Content Security Policy
  "Content-Security-Policy": generateCSP(),

  // Permissions Policy (Feature Policy)
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "accelerometer=()",
    "gyroscope=()",
    "encrypted-media=()",
  ].join(", "),
} as const;

/**
 * Configurações de segurança para cookies
 */
export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 24 * 60 * 60, // 24 horas
  domain: process.env.NODE_ENV === "production" ? ".integreapp.com" : undefined,
  path: "/",
} as const;

/**
 * Configurações de rate limiting
 */
export const rateLimitConfig = {
  // Rate limit global
  global: {
    max: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },

  // Rate limit para autenticação
  auth: {
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    skipSuccessfulRequests: true,
  },

  // Rate limit para API
  api: {
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },

  // Rate limit para upload de arquivos
  upload: {
    max: 10,
    windowMs: 60 * 1000, // 1 minuto
  },
} as const;

/**
 * Configurações de validação de input
 */
export const inputValidation = {
  // Padrões de sanitização
  sanitization: {
    // Remove scripts e tags perigosas
    htmlSanitizer: {
      allowedTags: ["b", "i", "em", "strong", "p", "br"],
      allowedAttributes: {},
    },

    // Limites de tamanho
    maxStringLength: 10000,
    maxEmailLength: 254,
    maxNameLength: 100,
    maxPhoneLength: 20,
  },

  // Padrões regex seguros
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]{10,20}$/,
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    cep: /^\d{5}-?\d{3}$/,
    // Previne injeção de SQL e XSS
    safeName: /^[a-zA-ZÀ-ÿ\s\-'\.]{2,100}$/,
    safeText: /^[a-zA-Z0-9À-ÿ\s\-'\.,:;!?()]{0,1000}$/,
  },
} as const;

/**
 * Configurações de auditoria e logging
 */
export const auditConfig = {
  // Eventos que devem ser logados
  events: [
    "user.login",
    "user.logout",
    "user.failed_login",
    "user.password_change",
    "user.permission_change",
    "data.create",
    "data.update",
    "data.delete",
    "system.error",
    "security.violation",
  ],

  // Retenção de logs
  retention: {
    security: 365, // 1 ano
    audit: 90, // 3 meses
    error: 30, // 1 mês
  },

  // Dados sensíveis que nunca devem ser logados
  sensitiveFields: [
    "password",
    "token",
    "secret",
    "key",
    "credit_card",
    "ssn",
    "cpf",
  ],
} as const;

/**
 * Configurações de criptografia
 */
export const cryptoConfig = {
  // Configurações para hashing de senhas
  password: {
    saltRounds: 12,
    algorithm: "bcrypt",
  },

  // Configurações para tokens
  token: {
    algorithm: "HS256",
    issuer: "integreapp.com",
    audience: "integreapp.com",
  },

  // Configurações para criptografia de dados
  encryption: {
    algorithm: "aes-256-gcm",
    keyLength: 32,
    ivLength: 16,
  },
} as const;

/**
 * Verifica se uma string contém conteúdo perigoso
 */
export function containsMaliciousContent(input: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return maliciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitiza input do usuário
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .substring(0, inputValidation.sanitization.maxStringLength);
}
