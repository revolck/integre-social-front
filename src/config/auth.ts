export const authConfig = {
  allowedDomains: [
    "auth.integreapp.com",
    "localhost",
    "127.0.0.1",
    ...(process.env.NEXT_PUBLIC_ALLOWED_DOMAINS?.split(",") || []),
  ],
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDuration: 60 * 60 * 1000,
  },
  session: {
    maxAge: 24 * 60 * 60,
    refreshThreshold: 15 * 60,
    inactivityTimeout: 30 * 60 * 1000,
  },
  tokens: {
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
    emailVerificationExpiry: "24h",
    passwordResetExpiry: "1h",
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAttempts: 3,
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      scopes: ["openid", "email", "profile"],
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID,
      scopes: ["openid", "email", "profile"],
    },
  },
} as const;
