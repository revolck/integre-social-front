// src/middleware.tsx
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Identificar o tipo de subdomínio
  const isAuthSubdomain = host.startsWith("auth.");
  const isAppSubdomain = host.startsWith("app.");

  // Domínio principal -> redireciona para auth
  if (!isAuthSubdomain && !isAppSubdomain && pathname === "/") {
    return NextResponse.redirect(new URL("http://auth." + host));
  }

  // Evitar que /auth/login apareça na URL do navegador
  if (isAuthSubdomain && pathname.includes("/auth/login")) {
    // Se o usuário acessou diretamente /auth/login, redireciona para a raiz
    if (request.nextUrl.search) {
      return NextResponse.redirect(
        new URL(`/?${request.nextUrl.search}`, request.url)
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Evitar que /dashboard apareça nas URLs do app
  if (isAppSubdomain && pathname.startsWith("/dashboard/")) {
    // Extrair o caminho após /dashboard/
    const cleanPath = pathname.replace("/dashboard/", "/");
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth/login", "/dashboard/:path*"],
};
