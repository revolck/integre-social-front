import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para rotas principais
 *
 * Este middleware lida com redirecionamentos básicos entre rotas
 * Durante a fase de desenvolvimento, não há verificação de autenticação
 */
export function middleware(request: NextRequest) {
  // Obtém o caminho da URL
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Verificação de subdomínio "app"
  const isAppSubdomain = host.startsWith("app.");

  // Redireciona a rota raiz para autenticação (quando não está no subdomínio app)
  if (pathname === "/" && !isAppSubdomain) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Permite o acesso a todas as outras rotas
  return NextResponse.next();
}
