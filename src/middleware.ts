import { NextRequest, NextResponse } from "next/server";
import { securityHeaders, rateLimitConfig } from "@/config/security";
import { authConfig } from "@/config/auth";

// Rate limiting em memória (para produção usar Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rotas protegidas que requerem autenticação
const protectedRoutes = ["/dashboard", "/api/protected"];

// Rotas de auth que não devem ser acessadas se já autenticado
const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

// Rotas públicas que não precisam de verificação
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/api/health",
];

/**
 * Verificar rate limiting
 */
function checkRateLimit(request: NextRequest): boolean {
  const ip = getClientIP(request);
  const key = `rate_limit:${ip}`;
  const now = Date.now();
  const windowMs = rateLimitConfig.global.windowMs;
  const maxRequests = rateLimitConfig.global.max;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    // Nova janela de tempo
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= maxRequests) {
    return false; // Rate limited
  }

  // Incrementar contador
  current.count++;
  rateLimitStore.set(key, current);
  return true;
}

/**
 * Obter IP do cliente
 */
function getClientIP(request: NextRequest): string {
  // Tentar obter IP de headers de proxy
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.ip || "unknown";
}

/**
 * Verificar se a requisição vem de um bot malicioso
 */
function isBlockedUserAgent(userAgent: string): boolean {
  const blockedPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /masscan/i,
    /python-requests/i,
    /curl/i,
    /wget/i,
    /scanner/i,
    /bot.*malicious/i,
  ];

  return blockedPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Verificar se a requisição contém padrões suspeitos
 */
function hasSuspiciousPatterns(request: NextRequest): boolean {
  const url = request.url.toLowerCase();
  const suspiciousPatterns = [
    // SQL Injection
    /union.*select/i,
    /select.*from/i,
    /insert.*into/i,
    /delete.*from/i,
    /drop.*table/i,

    // XSS
    /<script/i,
    /javascript:/i,
    /onclick=/i,
    /onerror=/i,

    // Path Traversal
    /\.\.\//,
    /\.\.%2f/i,
    /\.\.%5c/i,

    // Command Injection
    /;.*rm\s/i,
    /;.*cat\s/i,
    /;.*ls\s/i,
    /\|.*nc\s/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(url));
}

/**
 * Verificar se o token JWT é válido (básico)
 */
function isValidJWT(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Verificar se consegue decodificar o payload
    const payload = JSON.parse(atob(parts[1]));

    // Verificar se não está expirado
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verificar autenticação
 */
function checkAuthentication(request: NextRequest): boolean {
  // Verificar cookie de sessão
  const sessionToken = request.cookies.get("accessToken")?.value;
  if (sessionToken && isValidJWT(sessionToken)) {
    return true;
  }

  // Verificar header Authorization
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return isValidJWT(token);
  }

  return false;
}

/**
 * Aplicar headers de segurança
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Aplicar todos os headers de segurança
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Headers específicos para diferentes tipos de conteúdo
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    // Headers específicos para HTML
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  if (contentType.includes("application/json")) {
    // Headers específicos para API
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

/**
 * Middleware principal
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const userAgent = request.headers.get("user-agent") || "";
  const method = request.method;

  // Log da requisição (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `${method} ${pathname} - ${getClientIP(request)} - ${userAgent}`
    );
  }

  // 1. Verificar User-Agent suspeito
  if (isBlockedUserAgent(userAgent)) {
    console.warn(`Blocked suspicious user agent: ${userAgent}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Verificar padrões suspeitos na URL
  if (hasSuspiciousPatterns(request)) {
    console.warn(`Blocked suspicious request: ${request.url}`);
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 3. Verificar rate limiting
  if (!checkRateLimit(request)) {
    console.warn(`Rate limited: ${getClientIP(request)}`);
    const response = new NextResponse("Too Many Requests", { status: 429 });
    response.headers.set("Retry-After", "900"); // 15 minutos
    return applySecurityHeaders(response);
  }

  // 4. Verificar HTTPS em produção
  if (
    process.env.NODE_ENV === "production" &&
    !request.headers.get("x-forwarded-proto")?.includes("https")
  ) {
    return NextResponse.redirect(
      `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
    );
  }

  // 5. Roteamento baseado em subdomínio
  const isAuthSubdomain = host.startsWith("auth.");
  const isAppSubdomain = host.startsWith("app.");
  const isApiSubdomain = host.startsWith("api.");

  // === SUBDOMÍNIO API ===
  if (isApiSubdomain) {
    // Rate limiting mais restritivo para API
    const apiKey = `api_rate_limit:${getClientIP(request)}`;
    const apiCurrent = rateLimitStore.get(apiKey);
    const now = Date.now();

    if (!apiCurrent || now > apiCurrent.resetTime) {
      rateLimitStore.set(apiKey, {
        count: 1,
        resetTime: now + rateLimitConfig.api.windowMs,
      });
    } else if (apiCurrent.count >= rateLimitConfig.api.max) {
      const response = new NextResponse("API Rate Limit Exceeded", {
        status: 429,
      });
      response.headers.set(
        "X-RateLimit-Limit",
        rateLimitConfig.api.max.toString()
      );
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set(
        "X-RateLimit-Reset",
        Math.ceil(apiCurrent.resetTime / 1000).toString()
      );
      return applySecurityHeaders(response);
    } else {
      apiCurrent.count++;
      rateLimitStore.set(apiKey, apiCurrent);
    }

    // Continuar para a API
    return applySecurityHeaders(NextResponse.next());
  }

  // === SUBDOMÍNIO AUTH ===
  if (isAuthSubdomain) {
    // Rate limiting específico para auth
    const authKey = `auth_rate_limit:${getClientIP(request)}`;
    const authCurrent = rateLimitStore.get(authKey);
    const now = Date.now();

    if (method === "POST" && pathname.includes("/login")) {
      if (!authCurrent || now > authCurrent.resetTime) {
        rateLimitStore.set(authKey, {
          count: 1,
          resetTime: now + rateLimitConfig.auth.windowMs,
        });
      } else if (authCurrent.count >= rateLimitConfig.auth.max) {
        console.warn(`Auth rate limited: ${getClientIP(request)}`);
        const response = new NextResponse("Too Many Login Attempts", {
          status: 429,
        });
        response.headers.set("Retry-After", "900");
        return applySecurityHeaders(response);
      } else {
        authCurrent.count++;
        rateLimitStore.set(authKey, authCurrent);
      }
    }

    // Redirecionar raiz para login
    if (pathname === "/" || pathname === "") {
      const response = NextResponse.rewrite(
        new URL("/auth/login", request.url)
      );
      return applySecurityHeaders(response);
    }

    // Verificar se já está autenticado em rotas de auth
    if (authRoutes.some((route) => pathname.startsWith(route))) {
      const isAuthenticated = checkAuthentication(request);
      if (isAuthenticated) {
        // Já autenticado, redirecionar para dashboard
        return NextResponse.redirect(
          new URL("https://app." + host + "/dashboard/overview")
        );
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // === SUBDOMÍNIO APP ===
  if (isAppSubdomain) {
    // Verificar autenticação para rotas protegidas
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      const isAuthenticated = checkAuthentication(request);

      if (!isAuthenticated) {
        // Não autenticado, redirecionar para login
        const loginUrl = `https://auth.${host}/login?returnUrl=${encodeURIComponent(
          pathname
        )}`;
        return NextResponse.redirect(loginUrl);
      }
    }

    // Mapear rota raiz para dashboard
    if (pathname === "/") {
      const response = NextResponse.rewrite(
        new URL("/dashboard/overview", request.url)
      );
      return applySecurityHeaders(response);
    }

    // Mapear rotas simplificadas
    const dashboardRoutes = [
      "overview",
      "users",
      "settings",
      "beneficiaries",
      "projects",
      "analytics",
      "financial",
    ];

    const pathSegment = pathname.split("/")[1];
    if (pathSegment && dashboardRoutes.includes(pathSegment)) {
      const response = NextResponse.rewrite(
        new URL(`/dashboard/${pathSegment}`, request.url)
      );
      return applySecurityHeaders(response);
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // === DOMÍNIO PRINCIPAL ===
  if (!isAuthSubdomain && !isAppSubdomain && !isApiSubdomain) {
    // Redirecionar para auth se não for rota pública
    if (!publicRoutes.includes(pathname) && pathname !== "/") {
      return NextResponse.redirect(`https://auth.${host}`);
    }

    // Redirecionar raiz para auth
    if (pathname === "/") {
      return NextResponse.redirect(`https://auth.${host}`);
    }
  }

  // Aplicar headers de segurança e continuar
  return applySecurityHeaders(NextResponse.next());
}

/**
 * Configuração do middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - manifest.json (PWA manifest)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
