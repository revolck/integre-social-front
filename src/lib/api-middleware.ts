/**
 * Middleware para API Routes do Next.js
 * Implementa autenticação, autorização, validação e rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeInput, containsMaliciousContent } from "@/config/security";
import { UserRole, hasPermission } from "@/config/auth";
import { z } from "zod";

// Tipos para middleware
export interface ApiRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    organizationId: string;
    permissions: string[];
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

export interface MiddlewareOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: UserRole[];
  rateLimit?: {
    max: number;
    windowMs: number;
  };
  validation?: {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
  };
  audit?: boolean;
  cors?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
  };
}

/**
 * Middleware principal para API routes
 */
export function withApiMiddleware(
  handler: (req: ApiRequest) => Promise<NextResponse>,
  options: MiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    let user: ApiRequest["user"] | undefined;

    try {
      // 1. CORS Headers
      const response = new NextResponse();
      const corsHeaders = getCorsHeaders(request, options.cors);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Handle preflight requests
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 200,
          headers: response.headers,
        });
      }

      // 2. Rate Limiting
      if (options.rateLimit) {
        const rateLimitResult = await checkApiRateLimit(
          request,
          options.rateLimit
        );

        if (!rateLimitResult.success) {
          return createErrorResponse("Rate limit exceeded", 429, {
            "X-RateLimit-Limit": options.rateLimit.max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "",
            "Retry-After": Math.ceil(
              options.rateLimit.windowMs / 1000
            ).toString(),
          });
        }

        // Adicionar headers de rate limit
        response.headers.set(
          "X-RateLimit-Limit",
          options.rateLimit.max.toString()
        );
        response.headers.set(
          "X-RateLimit-Remaining",
          rateLimitResult.remaining.toString()
        );
        response.headers.set(
          "X-RateLimit-Reset",
          rateLimitResult.reset?.toString() || ""
        );
      }

      // 3. Security Checks
      const securityCheck = performSecurityChecks(request);
      if (!securityCheck.success) {
        return createErrorResponse(securityCheck.error!, 400);
      }

      // 4. Authentication
      if (options.requireAuth) {
        const authResult = await authenticateRequest(request);

        if (!authResult.success) {
          return createErrorResponse("Unauthorized", 401);
        }

        user = authResult.user;
        (request as ApiRequest).user = user;
      }

      // 5. Authorization
      if (options.requiredPermissions && user) {
        const hasRequiredPermissions = options.requiredPermissions.every(
          (permission) => hasPermission(user.role, permission)
        );

        if (!hasRequiredPermissions) {
          return createErrorResponse("Forbidden", 403);
        }
      }

      if (options.requiredRole && user) {
        const hasRequiredRole = options.requiredRole.includes(user.role);

        if (!hasRequiredRole) {
          return createErrorResponse("Forbidden", 403);
        }
      }

      // 6. Request Validation
      if (options.validation) {
        const validationResult = await validateApiRequest(
          request,
          options.validation
        );

        if (!validationResult.success) {
          return createErrorResponse(
            "Validation failed",
            400,
            {},
            {
              errors: validationResult.errors,
            }
          );
        }
      }

      // 7. Execute Handler
      const result = await handler(request as ApiRequest);

      // 8. Audit Log
      if (options.audit) {
        await logApiRequest({
          request,
          user,
          response: result,
          duration: Date.now() - startTime,
          success: result.status < 400,
        });
      }

      // 9. Add Security Headers
      addSecurityHeaders(result);

      return result;
    } catch (error) {
      console.error("API Middleware Error:", error);

      // Audit log para erros
      if (options.audit) {
        await logApiRequest({
          request,
          user,
          response: null,
          duration: Date.now() - startTime,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      return createErrorResponse("Internal Server Error", 500);
    }
  };
}

/**
 * Verificar rate limiting para API
 */
async function checkApiRateLimit(
  request: NextRequest,
  config: { max: number; windowMs: number }
) {
  const identifier = getRequestIdentifier(request);

  return await rateLimit({
    identifier,
    limit: config.max,
    window: config.windowMs,
  });
}

/**
 * Obter identificador único da requisição
 */
function getRequestIdentifier(request: NextRequest): string {
  // Tentar obter IP do cliente
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  const ip =
    cfConnectingIP || realIP || forwarded?.split(",")[0].trim() || "unknown";

  // Tentar obter user ID do token
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return `user:${payload.sub || payload.userId}`;
    } catch {
      // Token inválido, usar IP
    }
  }

  return `ip:${ip}`;
}

/**
 * Verificações de segurança
 */
function performSecurityChecks(request: NextRequest): {
  success: boolean;
  error?: string;
} {
  const userAgent = request.headers.get("user-agent") || "";
  const url = request.url;

  // Verificar User-Agent suspeito
  const suspiciousAgents = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /python-requests/i,
    /curl.*bot/i,
  ];

  if (suspiciousAgents.some((pattern) => pattern.test(userAgent))) {
    return { success: false, error: "Suspicious user agent" };
  }

  // Verificar padrões maliciosos na URL
  if (containsMaliciousContent(url)) {
    return { success: false, error: "Malicious content detected" };
  }

  // Verificar tamanho do body (se houver)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    // 10MB
    return { success: false, error: "Request body too large" };
  }

  return { success: true };
}

/**
 * Autenticar requisição
 */
async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: ApiRequest["user"];
}> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { success: false };
  }

  try {
    // Verificar formato do token
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { success: false };
    }

    // Decodificar payload
    const payload = JSON.parse(atob(parts[1]));

    // Verificar expiração
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { success: false };
    }

    // Buscar usuário no banco de dados (simulado)
    const user = await getUserFromToken(payload);

    if (!user) {
      return { success: false };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Authentication error:", error);
    return { success: false };
  }
}

/**
 * Simular busca de usuário por token
 */
async function getUserFromToken(
  payload: any
): Promise<ApiRequest["user"] | null> {
  // Em produção, fazer consulta ao banco de dados
  // Por enquanto, retornar dados do payload

  if (!payload.sub && !payload.userId) {
    return null;
  }

  return {
    id: payload.sub || payload.userId,
    email: payload.email || "",
    role: payload.role || UserRole.VIEWER,
    organizationId: payload.organizationId || "",
    permissions: payload.permissions || [],
  };
}

/**
 * Validar requisição API
 */
async function validateApiRequest(
  request: NextRequest,
  schemas: MiddlewareOptions["validation"]
): Promise<{ success: boolean; errors?: any }> {
  try {
    const errors: Record<string, any> = {};

    // Validar body
    if (schemas?.body && request.method !== "GET") {
      try {
        const body = await request.json();
        const sanitizedBody = sanitizeRequestBody(body);
        schemas.body.parse(sanitizedBody);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.body = error.errors;
        } else {
          errors.body = "Invalid JSON body";
        }
      }
    }

    // Validar query parameters
    if (schemas?.query) {
      try {
        const url = new URL(request.url);
        const query = Object.fromEntries(url.searchParams.entries());
        schemas.query.parse(query);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.query = error.errors;
        }
      }
    }

    // Validar params (seria implementado para rotas dinâmicas)
    if (schemas?.params) {
      // Implementar extração de params da URL
    }

    return {
      success: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      errors: { general: "Validation error" },
    };
  }
}

/**
 * Sanitizar body da requisição
 */
function sanitizeRequestBody(body: any): any {
  if (typeof body === "string") {
    return sanitizeInput(body);
  }

  if (Array.isArray(body)) {
    return body.map(sanitizeRequestBody);
  }

  if (body && typeof body === "object") {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        if (containsMaliciousContent(value)) {
          throw new Error(`Malicious content detected in field: ${key}`);
        }
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = sanitizeRequestBody(value);
      }
    }

    return sanitized;
  }

  return body;
}

/**
 * Obter headers CORS
 */
function getCorsHeaders(
  request: NextRequest,
  cors?: MiddlewareOptions["cors"]
): Record<string, string> {
  const headers: Record<string, string> = {};

  if (!cors) {
    // CORS padrão restritivo
    headers["Access-Control-Allow-Origin"] =
      process.env.NEXT_PUBLIC_APP_URL || "*";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    return headers;
  }

  // CORS customizado
  const origin = request.headers.get("origin");

  if (cors.origin) {
    if (Array.isArray(cors.origin)) {
      if (origin && cors.origin.includes(origin)) {
        headers["Access-Control-Allow-Origin"] = origin;
      }
    } else if (typeof cors.origin === "string") {
      headers["Access-Control-Allow-Origin"] = cors.origin;
    }
  }

  if (cors.methods) {
    headers["Access-Control-Allow-Methods"] = cors.methods.join(", ");
  }

  if (cors.headers) {
    headers["Access-Control-Allow-Headers"] = cors.headers.join(", ");
  }

  headers["Access-Control-Allow-Credentials"] = "true";
  headers["Access-Control-Max-Age"] = "86400"; // 24 horas

  return headers;
}

/**
 * Adicionar headers de segurança
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}

/**
 * Criar resposta de erro padronizada
 */
function createErrorResponse(
  message: string,
  status: number,
  headers: Record<string, string> = {},
  data?: any
): NextResponse {
  const response = NextResponse.json(
    {
      error: message,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    },
    { status }
  );

  // Adicionar headers customizados
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Adicionar headers de segurança
  addSecurityHeaders(response);

  return response;
}

/**
 * Log de auditoria para API
 */
async function logApiRequest({
  request,
  user,
  response,
  duration,
  success,
  error,
}: {
  request: NextRequest;
  user?: ApiRequest["user"];
  response?: NextResponse | null;
  duration: number;
  success: boolean;
  error?: string;
}): Promise<void> {
  try {
    const url = new URL(request.url);

    const logData = {
      method: request.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      userId: user?.id,
      organizationId: user?.organizationId,
      ip: getRequestIdentifier(request),
      userAgent: request.headers.get("user-agent"),
      status: response?.status || 0,
      duration,
      success,
      error,
      timestamp: new Date().toISOString(),
    };

    // Em produção, enviar para serviço de logging
    console.log("API Audit Log:", logData);

    // Implementar envio para Elasticsearch, CloudWatch, etc.
  } catch (logError) {
    console.error("Failed to log API request:", logError);
  }
}

/**
 * Helper para criar middleware específico
 */
export const withAuth = (handler: (req: ApiRequest) => Promise<NextResponse>) =>
  withApiMiddleware(handler, { requireAuth: true, audit: true });

export const withPermissions = (
  permissions: string[],
  handler: (req: ApiRequest) => Promise<NextResponse>
) =>
  withApiMiddleware(handler, {
    requireAuth: true,
    requiredPermissions: permissions,
    audit: true,
  });

export const withRateLimit = (
  limit: { max: number; windowMs: number },
  handler: (req: ApiRequest) => Promise<NextResponse>
) => withApiMiddleware(handler, { rateLimit: limit });

export const withValidation = (
  validation: MiddlewareOptions["validation"],
  handler: (req: ApiRequest) => Promise<NextResponse>
) => withApiMiddleware(handler, { validation, requireAuth: true, audit: true });
