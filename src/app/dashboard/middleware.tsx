// src/app/dashboard/middleware.tsx
import { NextRequest, NextResponse } from "next/server";

// Lista de módulos disponíveis
const SYSTEM_MODULES = [
  "analytics",
  "beneficiaries",
  "projects",
  "users",
  "settings",
];

// Matriz de permissões por função
const ROLE_PERMISSIONS = {
  admin: [...SYSTEM_MODULES],
  manager: ["analytics", "beneficiaries", "projects"],
  operator: ["beneficiaries", "projects"],
  viewer: ["analytics"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";
  const isAppSubdomain = host.startsWith("app.");

  // Se estamos no subdomínio app mas não temos o prefixo /dashboard/ na URL,
  // mas estamos processando este middleware, então provavelmente o Next.js
  // reescreveu a URL internamente. Não mexemos nesse caso.
  if (isAppSubdomain && !pathname.startsWith("/dashboard/")) {
    return NextResponse.next();
  }

  // Redirecionamento da raiz do dashboard para analytics
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL("/analytics", request.url));
  }

  // Extração do módulo da URL
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return NextResponse.next();

  const requestedModule = segments[1];

  // Ignorar recursos estáticos, APIs e arquivos
  if (
    pathname.includes("/_next/") ||
    pathname.includes("/api/") ||
    pathname.includes(".") ||
    !SYSTEM_MODULES.includes(requestedModule)
  ) {
    return NextResponse.next();
  }

  // Verificação de acesso baseado em função
  const userRole = request.cookies.get("dev_role")?.value || "viewer";
  const allowedModules =
    ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];

  // Se não tem permissão para o módulo
  if (!allowedModules.includes(requestedModule)) {
    // Redirecionar para não autorizado (usando URL limpa)
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Configurações de desenvolvimento
  if (process.env.NODE_ENV === "development") {
    const response = NextResponse.next();

    if (!request.cookies.has("tenant_id")) {
      response.cookies.set("tenant_id", "development-tenant", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set("tenant_name", "Empresa Demonstração", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    if (!request.cookies.has("dev_role")) {
      response.cookies.set("dev_role", "admin", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
