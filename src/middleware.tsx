// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Constantes para facilitar manutenção
const AUTH_COOKIE_NAME = "auth_token";
const TENANT_COOKIE_NAME = "current_tenant";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  const isAuthSubdomain = host.startsWith("auth.");
  const isAppSubdomain = host.startsWith("app.");

  // Caso 1: Redireciona o domínio principal para o subdomínio auth
  if (pathname === "/" && !isAuthSubdomain && !isAppSubdomain) {
    return NextResponse.redirect(new URL("http://auth." + host));
  }

  // Caso 2: Rota raiz do subdomínio auth -> reescrever para página de login
  if (isAuthSubdomain && pathname === "/") {
    return NextResponse.rewrite(new URL("/auth/login", request.url));
  }

  // NOVO - Caso 3: Rota raiz do subdomínio app -> reescrever para o dashboard
  if (isAppSubdomain && pathname === "/") {
    return NextResponse.rewrite(new URL("/dashboard/analytics", request.url));
  }

  // Caso 4: Redireciona a raiz do dashboard para analytics
  if (isAppSubdomain && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/analytics", request.url));
  }

  // Caso 5: Reescreve URLs do dashboard no subdomínio app
  if (isAppSubdomain && pathname.startsWith("/dashboard/")) {
    const path = pathname.replace("/dashboard/", "/");
    return NextResponse.rewrite(new URL(path, request.url));
  }

  // Permita o acesso a todas as outras rotas
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/select-tenant",
    "/maintenance",
    "/api/:path*",
  ],
};
