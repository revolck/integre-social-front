import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware específico para rotas do dashboard
 *
 * Este middleware é executado apenas nas rotas do dashboard
 * Configura o redirecionamento padrão para analytics e reescreve URLs
 */
export function middleware(request: NextRequest) {
  // Obtém o caminho da URL
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isAppSubdomain = host.startsWith("app.");

  // Redirecionar a raiz do dashboard para analytics como padrão
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/dashboard/analytics", request.url));
  }

  // Reescrever URLs para criar a experiência app.localhost:3000/analytics
  // em vez de app.localhost:3000/dashboard/analytics quando estiver no subdomínio app
  if (isAppSubdomain && pathname.startsWith("/dashboard/")) {
    const path = pathname.replace("/dashboard/", "/");
    return NextResponse.rewrite(new URL(path, request.url));
  }

  // Permitir acesso a todas as rotas do dashboard durante a fase de desenvolvimento
  return NextResponse.next();
}

// Configuração de quais caminhos este middleware será executado
export const config = {
  matcher: [
    // Executa em /dashboard e em todas as suas subrotas
    "/dashboard",
    "/dashboard/:path*",
  ],
};
