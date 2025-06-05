/**
 * Sistema de cache avançado com múltiplas camadas
 * Suporta Memory, localStorage, sessionStorage e Redis (futuro)
 */

import { cacheConfig } from "@/config/api";

// Tipos para o sistema de cache
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version?: string;
  tags?: string[];
  size?: number;
  hitCount?: number;
  lastAccessed?: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  version?: string;
  serialize?: boolean;
  compress?: boolean;
  priority?: "low" | "normal" | "high";
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  itemCount: number;
  hitRate: number;
}

// Estratégias de cache
export enum CacheStrategy {
  MEMORY_ONLY = "memory",
  PERSISTENT_ONLY = "persistent",
  MEMORY_THEN_PERSISTENT = "memory-persistent",
  PERSISTENT_THEN_MEMORY = "persistent-memory",
}

/**
 * Cache em memória otimizado com LRU
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private maxSize: number;
  private currentSize = 0;
  private accessCounter = 0;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    itemCount: 0,
    hitRate: 0,
  };

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || cacheConfig.defaultTTL;
    const dataSize = this.calculateSize(data);

    // Verificar se precisa fazer cleanup
    this.evictExpired();

    // Se exceder limite, remover itens menos usados
    while (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl,
      version: options.version,
      tags: options.tags,
      size: dataSize,
      hitCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
    this.currentSize += dataSize;

    this.stats.sets++;
    this.updateStats();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Verificar expiração
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.hitCount = (entry.hitCount || 0) + 1;
    entry.lastAccessed = Date.now();
    this.accessOrder.set(key, ++this.accessCounter);

    this.stats.hits++;
    this.updateStats();

    return entry.data as T;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);

    if (entry) {
      this.currentSize -= entry.size || 0;
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.stats.deletes++;
      this.updateStats();
      return true;
    }

    return false;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.currentSize = 0;
    this.accessCounter = 0;
    this.resetStats();
  }

  // Invalidar por tags
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
        this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  // Obter estatísticas
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Métodos privados
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictExpired(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 1; // Fallback
    }
  }

  private updateStats(): void {
    this.stats.size = this.currentSize;
    this.stats.itemCount = this.cache.size;
    this.stats.hitRate =
      this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      itemCount: 0,
      hitRate: 0,
    };
  }
}

/**
 * Cache persistente usando localStorage/sessionStorage
 */
class PersistentCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage = localStorage, prefix = "integreapp_cache_") {
    this.storage = storage;
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    try {
      const now = Date.now();
      const ttl = options.ttl || cacheConfig.defaultTTL;

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        ttl,
        version: options.version,
        tags: options.tags,
      };

      const serialized = JSON.stringify(entry);

      // Comprimir se necessário (implementação futura)
      if (options.compress) {
        // Implementar compressão
      }

      this.storage.setItem(this.prefix + key, serialized);
    } catch (error) {
      console.error("Erro ao salvar no cache persistente:", error);

      // Se der erro de quota, tentar limpar cache antigo
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        this.cleanup();
        // Tentar novamente
        try {
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: options.ttl || cacheConfig.defaultTTL,
            version: options.version,
            tags: options.tags,
          };
          this.storage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch {
          console.error("Não foi possível salvar no cache após cleanup");
        }
      }
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);

      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      // Verificar expiração
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Erro ao ler do cache persistente:", error);
      return null;
    }
  }

  delete(key: string): boolean {
    try {
      this.storage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error("Erro ao deletar do cache persistente:", error);
      return false;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage).filter((key) =>
        key.startsWith(this.prefix)
      );

      keys.forEach((key) => this.storage.removeItem(key));
    } catch (error) {
      console.error("Erro ao limpar cache persistente:", error);
    }
  }

  // Limpar entradas expiradas
  cleanup(): void {
    try {
      const now = Date.now();
      const keys = Object.keys(this.storage).filter((key) =>
        key.startsWith(this.prefix)
      );

      keys.forEach((key) => {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const entry: CacheEntry = JSON.parse(item);
            if (now - entry.timestamp > entry.ttl) {
              this.storage.removeItem(key);
            }
          }
        } catch {
          // Remove itens corrompidos
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Erro no cleanup do cache:", error);
    }
  }

  // Invalidar por tags
  invalidateByTags(tags: string[]): number {
    let invalidated = 0;

    try {
      const keys = Object.keys(this.storage).filter((key) =>
        key.startsWith(this.prefix)
      );

      keys.forEach((key) => {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const entry: CacheEntry = JSON.parse(item);
            if (entry.tags && entry.tags.some((tag) => tags.includes(tag))) {
              this.storage.removeItem(key);
              invalidated++;
            }
          }
        } catch {
          // Remove itens corrompidos
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Erro ao invalidar por tags:", error);
    }

    return invalidated;
  }
}

/**
 * Cache manager principal
 */
export class CacheManager {
  private memoryCache: MemoryCache;
  private persistentCache: PersistentCache;
  private sessionCache: PersistentCache;
  private strategy: CacheStrategy;

  constructor(
    strategy: CacheStrategy = CacheStrategy.MEMORY_THEN_PERSISTENT,
    maxMemorySize = 1000
  ) {
    this.strategy = strategy;
    this.memoryCache = new MemoryCache(maxMemorySize);

    if (typeof window !== "undefined") {
      this.persistentCache = new PersistentCache(localStorage);
      this.sessionCache = new PersistentCache(
        sessionStorage,
        "integreapp_session_"
      );
    } else {
      // Fallback para SSR
      this.persistentCache = new PersistentCache({} as Storage);
      this.sessionCache = new PersistentCache({} as Storage);
    }
  }

  set<T>(
    key: string,
    data: T,
    options: CacheOptions & { strategy?: CacheStrategy } = {}
  ): void {
    const strategy = options.strategy || this.strategy;

    switch (strategy) {
      case CacheStrategy.MEMORY_ONLY:
        this.memoryCache.set(key, data, options);
        break;

      case CacheStrategy.PERSISTENT_ONLY:
        this.persistentCache.set(key, data, options);
        break;

      case CacheStrategy.MEMORY_THEN_PERSISTENT:
        this.memoryCache.set(key, data, options);
        if (options.priority !== "low") {
          this.persistentCache.set(key, data, options);
        }
        break;

      case CacheStrategy.PERSISTENT_THEN_MEMORY:
        this.persistentCache.set(key, data, options);
        if (options.priority === "high") {
          this.memoryCache.set(key, data, options);
        }
        break;
    }
  }

  get<T>(key: string, strategy?: CacheStrategy): T | null {
    const cacheStrategy = strategy || this.strategy;

    switch (cacheStrategy) {
      case CacheStrategy.MEMORY_ONLY:
        return this.memoryCache.get<T>(key);

      case CacheStrategy.PERSISTENT_ONLY:
        return this.persistentCache.get<T>(key);

      case CacheStrategy.MEMORY_THEN_PERSISTENT:
        let data = this.memoryCache.get<T>(key);
        if (data === null) {
          data = this.persistentCache.get<T>(key);
          // Se encontrou no persistente, promover para memória
          if (data !== null) {
            this.memoryCache.set(key, data, { ttl: cacheConfig.defaultTTL });
          }
        }
        return data;

      case CacheStrategy.PERSISTENT_THEN_MEMORY:
        let persistentData = this.persistentCache.get<T>(key);
        if (persistentData === null) {
          persistentData = this.memoryCache.get<T>(key);
        }
        return persistentData;

      default:
        return null;
    }
  }

  delete(key: string): boolean {
    const memoryResult = this.memoryCache.delete(key);
    const persistentResult = this.persistentCache.delete(key);
    return memoryResult || persistentResult;
  }

  has(key: string): boolean {
    return this.memoryCache.has(key) || this.persistentCache.has(key);
  }

  clear(): void {
    this.memoryCache.clear();
    this.persistentCache.clear();
    this.sessionCache.clear();
  }

  invalidateByTags(tags: string[]): number {
    const memoryInvalidated = this.memoryCache.invalidateByTags(tags);
    const persistentInvalidated = this.persistentCache.invalidateByTags(tags);
    return memoryInvalidated + persistentInvalidated;
  }

  getStats(): { memory: CacheStats; persistent: any } {
    return {
      memory: this.memoryCache.getStats(),
      persistent: {
        // Implementar estatísticas para cache persistente
        itemCount: 0,
        size: 0,
      },
    };
  }

  // Métodos de conveniência
  setSession<T>(key: string, data: T, ttl?: number): void {
    this.sessionCache.set(key, data, { ttl: ttl || 30 * 60 * 1000 }); // 30 min
  }

  getSession<T>(key: string): T | null {
    return this.sessionCache.get<T>(key);
  }

  deleteSession(key: string): boolean {
    return this.sessionCache.delete(key);
  }

  // Cleanup automático
  startPeriodicCleanup(intervalMs = 5 * 60 * 1000): void {
    setInterval(() => {
      this.persistentCache.cleanup();
      this.sessionCache.cleanup();
    }, intervalMs);
  }
}

// Instância global do cache
export const cache = new CacheManager();

// Hooks para React
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const cachedData = cache.get<T>(key);

    if (cachedData) {
      setData(cachedData);
    } else {
      fetchData();
    }
  }, [key]);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetcher();

      cache.set(key, result, options);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, options]);

  const refetch = React.useCallback(async () => {
    cache.delete(key);
    await fetchData();
  }, [key, fetchData]);

  return { data, isLoading, error, refetch };
}

// Utilitários
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  organization: (id: string) => `org:${id}`,
  permissions: (userId: string) => `permissions:${userId}`,
  analytics: (orgId: string, period: string) => `analytics:${orgId}:${period}`,
  beneficiaries: (orgId: string, filters?: string) =>
    `beneficiaries:${orgId}${filters ? `:${filters}` : ""}`,
};

export const cacheTags = {
  USER: "user",
  ORGANIZATION: "organization",
  PERMISSIONS: "permissions",
  ANALYTICS: "analytics",
  BENEFICIARIES: "beneficiaries",
  FINANCIAL: "financial",
};
