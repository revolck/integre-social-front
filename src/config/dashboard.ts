export const dashboardConfig = {
  inactivityTimeout: 30 * 60 * 1000,
  sessionRefreshThreshold: 5 * 60 * 1000,
  sessionWarningThreshold: 2 * 60 * 1000,
  routePermissions: {
    "/dashboard": ["dashboard:read"],
    "/dashboard/overview": ["dashboard:read", "overview:read"],
    "/dashboard/users": ["dashboard:read", "users:read"],
    "/dashboard/users/create": ["dashboard:read", "users:create"],
    "/dashboard/users/edit": ["dashboard:read", "users:update"],
    "/dashboard/settings": ["dashboard:read", "settings:read"],
    "/dashboard/settings/security": ["dashboard:read", "settings:security"],
    "/dashboard/analytics": ["dashboard:read", "analytics:read"],
    "/dashboard/reports": ["dashboard:read", "reports:read"],
  } as Record<string, string[]>,
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || "wss://ws.integreapp.com",
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    heartbeatInterval: 30000,
  },
  cache: {
    defaultTTL: 5 * 60 * 1000,
    longTTL: 60 * 60 * 1000,
    shortTTL: 30 * 1000,
  },
  pagination: {
    defaultPageSize: 25,
    maxPageSize: 100,
    allowedPageSizes: [10, 25, 50, 100],
  },
} as const;
