export function generateCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const policies: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      "https://cdn.jsdelivr.net",
      "https://unpkg.com",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
    ],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.integreapp.com",
      "wss://ws.integreapp.com",
      ...(isDev ? ["ws://localhost:", "http://localhost:"] : []),
    ],
    "media-src": ["'self'"],
    "object-src": ["'none'"],
    "child-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "base-uri": ["'self'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
  };

  return Object.entries(policies)
    .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
    .join("; ");
}
