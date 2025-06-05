/**
 * Cliente API centralizado com segurança e retry logic
 * Implementa interceptors, cache, retry e error handling
 */

import { apiConfig, buildEndpointURL } from "@/config/api";
import { sanitizeInput, containsMaliciousContent } from "@/config/security";

// Tipos para requisições
interface ApiRequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
  signal?: AbortSignal;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
  message?: string;
}

interface RequestInterceptor {
  onRequest?: (
    config: ApiRequestConfig
  ) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onError?: (error: Error) => void | Promise<void>;
}

interface ResponseInterceptor {
  onResponse?: <T>(
    response: ApiResponse<T>
  ) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onError?: (error: Error) => void | Promise<void>;
}

// Cache em memória
class MemoryCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Classe principal do cliente API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;
  private cache: MemoryCache;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.defaultHeaders = { ...apiConfig.defaultHeaders };
    this.timeout = apiConfig.timeout;
    this.retries = apiConfig.retry.attempts;
    this.cache = new MemoryCache();

    // Adicionar interceptor padrão para auth
    this.addRequestInterceptor({
      onRequest: (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
    });

    // Interceptor para lidar com erros de auth
    this.addResponseInterceptor({
      onError: async (error: any) => {
        if (error.status === 401) {
          // Token expirado, tentar refresh
          await this.refreshToken();
        }
      },
    });
  }

  /**
   * Adicionar interceptor de request
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Adicionar interceptor de response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Refresh do token de acesso
   */
  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token não encontrado");
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        // Refresh falhou, redirecionar para login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Erro no refresh token:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth/login";
    }
  }

  /**
   * Função principal de requisição
   */
  async request<T = any>(
    url: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = this.timeout,
      retries = this.retries,
      cache = false,
      cacheTTL = 5 * 60 * 1000,
      signal,
    } = config;

    // Verificar cache para requests GET
    if (method === "GET" && cache) {
      const cacheKey = `${url}_${JSON.stringify(config)}`;
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return {
          data: cachedData,
          status: 200,
          success: true,
        };
      }
    }

    // Preparar configuração da requisição
    let requestConfig: ApiRequestConfig = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      body,
      timeout,
      retries,
    };

    // Aplicar interceptors de request
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          requestConfig = await interceptor.onRequest(requestConfig);
        } catch (error) {
          if (interceptor.onError) {
            await interceptor.onError(error as Error);
          }
        }
      }
    }

    // Sanitizar body se for string
    if (typeof requestConfig.body === "string") {
      if (containsMaliciousContent(requestConfig.body)) {
        return {
          error: "Conteúdo malicioso detectado",
          status: 400,
          success: false,
        };
      }
      requestConfig.body = sanitizeInput(requestConfig.body);
    }

    // Executar requisição com retry
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        if (signal) {
          signal.addEventListener("abort", () => controller.abort());
        }

        const fetchConfig: RequestInit = {
          method: requestConfig.method,
          headers: requestConfig.headers,
          signal: controller.signal,
        };

        if (requestConfig.body) {
          if (typeof requestConfig.body === "object") {
            fetchConfig.body = JSON.stringify(requestConfig.body);
          } else {
            fetchConfig.body = requestConfig.body;
          }
        }

        const response = await fetch(url, fetchConfig);
        clearTimeout(timeoutId);

        let data: T | undefined;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = (await response.text()) as any;
        }

        const apiResponse: ApiResponse<T> = {
          data,
          status: response.status,
          success: response.ok,
          error: response.ok ? undefined : `HTTP ${response.status}`,
        };

        // Aplicar interceptors de response
        let finalResponse = apiResponse;
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponse) {
            try {
              finalResponse = await interceptor.onResponse(finalResponse);
            } catch (error) {
              if (interceptor.onError) {
                await interceptor.onError(error as Error);
              }
            }
          }
        }

        // Cachear response se sucesso e cache habilitado
        if (finalResponse.success && method === "GET" && cache) {
          const cacheKey = `${url}_${JSON.stringify(config)}`;
          this.cache.set(cacheKey, finalResponse.data, cacheTTL);
        }

        return finalResponse;
      } catch (error) {
        lastError = error as Error;

        // Aplicar interceptors de erro
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onError) {
            await interceptor.onError(lastError);
          }
        }

        // Se não é o último retry, aguardar antes de tentar novamente
        if (attempt < retries) {
          const delay =
            apiConfig.retry.delay * Math.pow(apiConfig.retry.backoff, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Todos os retries falharam
    return {
      error: lastError?.message || "Erro de conexão",
      status: 0,
      success: false,
    };
  }

  /**
   * Métodos de conveniência
   */
  async get<T = any>(
    url: string,
    config?: Omit<ApiRequestConfig, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  async post<T = any>(
    url: string,
    body?: any,
    config?: Omit<ApiRequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "POST", body });
  }

  async put<T = any>(
    url: string,
    body?: any,
    config?: Omit<ApiRequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "PUT", body });
  }

  async patch<T = any>(
    url: string,
    body?: any,
    config?: Omit<ApiRequestConfig, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "PATCH", body });
  }

  async delete<T = any>(
    url: string,
    config?: Omit<ApiRequestConfig, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Definir base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Definir header padrão
   */
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }
}

// Instância global do cliente API
export const apiClient = new ApiClient();

// Funções utilitárias para microsserviços
export const authApi = {
  login: (credentials: any) =>
    apiClient.post(buildEndpointURL("auth", "/login"), credentials),
  logout: () => apiClient.post(buildEndpointURL("auth", "/logout")),
  refresh: (token: string) =>
    apiClient.post(buildEndpointURL("auth", "/refresh"), {
      refreshToken: token,
    }),
  getProfile: () =>
    apiClient.get(buildEndpointURL("auth", "/profile"), { cache: true }),
};

export const usersApi = {
  list: (params?: any) =>
    apiClient.get(buildEndpointURL("users", "/"), { cache: true }),
  create: (user: any) => apiClient.post(buildEndpointURL("users", "/"), user),
  get: (id: string) =>
    apiClient.get(buildEndpointURL("users", "/:id", { id }), { cache: true }),
  update: (id: string, data: any) =>
    apiClient.patch(buildEndpointURL("users", "/:id", { id }), data),
  delete: (id: string) =>
    apiClient.delete(buildEndpointURL("users", "/:id", { id })),
};

export const organizationsApi = {
  list: () =>
    apiClient.get(buildEndpointURL("organizations", "/"), { cache: true }),
  create: (org: any) =>
    apiClient.post(buildEndpointURL("organizations", "/"), org),
  get: (id: string) =>
    apiClient.get(buildEndpointURL("organizations", "/:id", { id }), {
      cache: true,
    }),
  update: (id: string, data: any) =>
    apiClient.patch(buildEndpointURL("organizations", "/:id", { id }), data),
};

export const beneficiariesApi = {
  list: (params?: any) =>
    apiClient.get(buildEndpointURL("beneficiaries", "/"), { cache: true }),
  create: (beneficiary: any) =>
    apiClient.post(buildEndpointURL("beneficiaries", "/"), beneficiary),
  get: (id: string) =>
    apiClient.get(buildEndpointURL("beneficiaries", "/:id", { id }), {
      cache: true,
    }),
  update: (id: string, data: any) =>
    apiClient.patch(buildEndpointURL("beneficiaries", "/:id", { id }), data),
  delete: (id: string) =>
    apiClient.delete(buildEndpointURL("beneficiaries", "/:id", { id })),
};
