/**
 * Sistema de Rate Limiting
 * Implementa diferentes algoritmos de rate limiting com memória e Redis
 */

import { cache } from "./cache";

// Tipos para rate limiting
export interface RateLimitConfig {
  identifier: string;
  limit: number;
  window: number; // em millisegundos
  algorithm?: "sliding_window" | "fixed_window" | "token_bucket";
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  blockDuration?: number; // tempo de bloqueio após exceder limite
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface TokenBucketState {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number; // tokens por segundo
}

export interface SlidingWindowState {
  requests: number[];
  windowStart: number;
}

/**
 * Rate limiter baseado em algoritmo de token bucket
 */
class TokenBucketRateLimiter {
  private states = new Map<string, TokenBucketState>();

  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { identifier, limit, window } = config;
    const now = Date.now();

    // Recuperar ou criar estado do bucket
    let state = this.states.get(identifier);

    if (!state) {
      state = {
        tokens: limit,
        lastRefill: now,
        capacity: limit,
        refillRate: limit / (window / 1000), // tokens por segundo
      };
      this.states.set(identifier, state);
    }

    // Calcular tokens a adicionar baseado no tempo decorrido
    const timePassed = (now - state.lastRefill) / 1000; // em segundos
    const tokensToAdd = Math.floor(timePassed * state.refillRate);

    if (tokensToAdd > 0) {
      state.tokens = Math.min(state.capacity, state.tokens + tokensToAdd);
      state.lastRefill = now;
    }

    // Verificar se há tokens disponíveis
    if (state.tokens >= 1) {
      state.tokens -= 1;

      return {
        success: true,
        limit,
        remaining: Math.floor(state.tokens),
        reset:
          now + ((state.capacity - state.tokens) / state.refillRate) * 1000,
      };
    }

    // Rate limited
    const timeToNextToken = (1 / state.refillRate) * 1000;

    return {
      success: false,
      limit,
      remaining: 0,
      reset: now + timeToNextToken,
      retryAfter: Math.ceil(timeToNextToken / 1000),
    };
  }

  // Limpar estados antigos
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [key, state] of this.states.entries()) {
      if (now - state.lastRefill > maxAge) {
        this.states.delete(key);
      }
    }
  }
}

/**
 * Rate limiter baseado em janela deslizante
 */
class SlidingWindowRateLimiter {
  private states = new Map<string, SlidingWindowState>();

  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { identifier, limit, window } = config;
    const now = Date.now();

    // Recuperar ou criar estado da janela
    let state = this.states.get(identifier);

    if (!state) {
      state = {
        requests: [],
        windowStart: now,
      };
      this.states.set(identifier, state);
    }

    // Remover requisições fora da janela
    const windowStart = now - window;
    state.requests = state.requests.filter(
      (timestamp) => timestamp > windowStart
    );

    // Verificar limite
    if (state.requests.length >= limit) {
      const oldestRequest = Math.min(...state.requests);
      const retryAfter = Math.ceil((oldestRequest + window - now) / 1000);

      return {
        success: false,
        limit,
        remaining: 0,
        reset: oldestRequest + window,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    // Adicionar nova requisição
    state.requests.push(now);

    return {
      success: true,
      limit,
      remaining: limit - state.requests.length,
      reset: now + window,
    };
  }

  // Limpar estados antigos
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [key, state] of this.states.entries()) {
      // Remover estados com janelas muito antigas
      const latestRequest = Math.max(...state.requests, 0);
      if (now - latestRequest > maxAge) {
        this.states.delete(key);
      }
    }
  }
}

/**
 * Rate limiter baseado em janela fixa
 */
class FixedWindowRateLimiter {
  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { identifier, limit, window } = config;
    const now = Date.now();

    // Calcular início da janela atual
    const windowStart = Math.floor(now / window) * window;
    const windowEnd = windowStart + window;
    const key = `rate_limit:${identifier}:${windowStart}`;

    // Recuperar contagem atual da janela
    let count = cache.get<number>(key) || 0;

    // Verificar limite
    if (count >= limit) {
      const retryAfter = Math.ceil((windowEnd - now) / 1000);

      return {
        success: false,
        limit,
        remaining: 0,
        reset: windowEnd,
        retryAfter,
      };
    }

    // Incrementar contagem
    count += 1;
    cache.set(key, count, { ttl: window * 2 }); // TTL duplo para segurança

    return {
      success: true,
      limit,
      remaining: limit - count,
      reset: windowEnd,
    };
  }
}

/**
 * Manager principal de rate limiting
 */
export class RateLimitManager {
  private tokenBucket = new TokenBucketRateLimiter();
  private slidingWindow = new SlidingWindowRateLimiter();
  private fixedWindow = new FixedWindowRateLimiter();
  private blockedIPs = new Map<string, number>();

  async checkLimit(config: RateLimitConfig): Promise<RateLimitResult> {
    const { identifier, algorithm = "sliding_window", blockDuration } = config;

    // Verificar se está bloqueado
    if (this.isBlocked(identifier)) {
      const unblockTime = this.blockedIPs.get(identifier)!;
      const retryAfter = Math.ceil((unblockTime - Date.now()) / 1000);

      return {
        success: false,
        limit: config.limit,
        remaining: 0,
        reset: unblockTime,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    // Executar rate limiting baseado no algoritmo
    let result: RateLimitResult;

    switch (algorithm) {
      case "token_bucket":
        result = await this.tokenBucket.checkLimit(config);
        break;
      case "fixed_window":
        result = await this.fixedWindow.checkLimit(config);
        break;
      case "sliding_window":
      default:
        result = await this.slidingWindow.checkLimit(config);
        break;
    }

    // Se excedeu o limite e tem duração de bloqueio, bloquear
    if (!result.success && blockDuration) {
      this.blockIdentifier(identifier, blockDuration);
    }

    return result;
  }

  // Bloquear identificador por duração específica
  private blockIdentifier(identifier: string, duration: number): void {
    const unblockTime = Date.now() + duration;
    this.blockedIPs.set(identifier, unblockTime);

    // Agendar remoção automática
    setTimeout(() => {
      this.blockedIPs.delete(identifier);
    }, duration);
  }

  // Verificar se identificador está bloqueado
  private isBlocked(identifier: string): boolean {
    const unblockTime = this.blockedIPs.get(identifier);

    if (!unblockTime) {
      return false;
    }

    if (Date.now() >= unblockTime) {
      this.blockedIPs.delete(identifier);
      return false;
    }

    return true;
  }

  // Desbloquear identificador manualmente
  unblock(identifier: string): void {
    this.blockedIPs.delete(identifier);
  }

  // Obter lista de bloqueados
  getBlocked(): Array<{ identifier: string; unblockTime: number }> {
    const now = Date.now();
    const blocked: Array<{ identifier: string; unblockTime: number }> = [];

    for (const [identifier, unblockTime] of this.blockedIPs.entries()) {
      if (unblockTime > now) {
        blocked.push({ identifier, unblockTime });
      } else {
        this.blockedIPs.delete(identifier);
      }
    }

    return blocked;
  }

  // Limpar caches antigos
  cleanup(): void {
    this.tokenBucket.cleanup();
    this.slidingWindow.cleanup();

    // Limpar IPs bloqueados expirados
    const now = Date.now();
    for (const [identifier, unblockTime] of this.blockedIPs.entries()) {
      if (now >= unblockTime) {
        this.blockedIPs.delete(identifier);
      }
    }
  }

  // Estatísticas
  getStats(): {
    blockedCount: number;
    totalBlocked: number;
  } {
    return {
      blockedCount: this.getBlocked().length,
      totalBlocked: this.blockedIPs.size,
    };
  }
}

// Instância global
export const rateLimitManager = new RateLimitManager();

// Função de conveniência
export async function rateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  return rateLimitManager.checkLimit(config);
}

// Presets de configuração
export const rateLimitPresets = {
  // API geral - 100 requests por 15 minutos
  api: {
    limit: 100,
    window: 15 * 60 * 1000,
    algorithm: "sliding_window" as const,
  },

  // Autenticação - 5 tentativas por 15 minutos
  auth: {
    limit: 5,
    window: 15 * 60 * 1000,
    algorithm: "fixed_window" as const,
    blockDuration: 60 * 60 * 1000, // 1 hora de bloqueio
  },

  // Upload de arquivos - 10 uploads por hora
  upload: {
    limit: 10,
    window: 60 * 60 * 1000,
    algorithm: "token_bucket" as const,
  },

  // Busca - 50 requests por minuto
  search: {
    limit: 50,
    window: 60 * 1000,
    algorithm: "sliding_window" as const,
  },

  // Criação de recursos - 20 por hora
  create: {
    limit: 20,
    window: 60 * 60 * 1000,
    algorithm: "token_bucket" as const,
  },

  // Envio de emails - 5 por hora
  email: {
    limit: 5,
    window: 60 * 60 * 1000,
    algorithm: "fixed_window" as const,
  },
} as const;

// Hook para React
export function useRateLimit(
  identifier: string,
  preset: keyof typeof rateLimitPresets
) {
  const [isLimited, setIsLimited] = React.useState(false);
  const [remaining, setRemaining] = React.useState(0);
  const [resetTime, setResetTime] = React.useState(0);

  const checkLimit = React.useCallback(async () => {
    const config = {
      identifier,
      ...rateLimitPresets[preset],
    };

    const result = await rateLimit(config);

    setIsLimited(!result.success);
    setRemaining(result.remaining);
    setResetTime(result.reset);

    return result;
  }, [identifier, preset]);

  return {
    isLimited,
    remaining,
    resetTime,
    checkLimit,
  };
}

// Cleanup automático
if (typeof window !== "undefined") {
  // Executar cleanup a cada 5 minutos
  setInterval(() => {
    rateLimitManager.cleanup();
  }, 5 * 60 * 1000);
}
