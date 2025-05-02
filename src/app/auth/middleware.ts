// src/app/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Evitar que /auth/login apareça na URL do navegador
  if (pathname.includes("/auth/login")) {
    if (request.nextUrl.search) {
      return NextResponse.redirect(
        new URL(`/?${request.nextUrl.search}`, request.url)
      );
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Específico para o subdomínio auth
    "/auth/:path*",
  ],
};
