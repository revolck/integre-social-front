"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { useSecurity } from "./use-security";
import { toastCustom } from "@/components/ui/custom/toast";

interface UseApiOptions {
  enabled?: boolean;
  retries?: number;
  retryDelay?: number;
  cacheTime?: number;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
}

interface MutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

/**
 * Hook para fazer requisições GET com cache e retry automático
 */
export function useApiQuery<T = any>(
  key: string | string[],
  url: string,
  options: UseApiOptions = {}
) {
  const { isAuthenticated } = useAuth();
  const { checkRateLimit } = useSecurity();

  const {
    enabled = true,
    retries = 3,
    cacheTime = 5 * 60 * 1000,
    staleTime = 1 * 60 * 1000,
    refetchOnWindowFocus = false,
    showErrorToast = true,
  } = options;

  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: async (): Promise<T> => {
      // Verificar rate limiting
      if (!checkRateLimit("api_requests", 50, 60 * 1000)) {
        throw new Error(
          "Rate limit excedido. Tente novamente em alguns minutos."
        );
      }

      const response = await apiClient.get<T>(url, {
        cache: true,
        cacheTTL: cacheTime,
      });

      if (!response.success) {
        throw new Error(response.error || "Erro na requisição");
      }

      return response.data as T;
    },
    enabled: enabled && isAuthenticated,
    retry: retries,
    gcTime: cacheTime,
    staleTime,
    refetchOnWindowFocus,
    throwOnError: (error: any) => {
      if (showErrorToast) {
        toastCustom.error({
          title: "Erro na requisição",
          description: error.message || "Não foi possível carregar os dados",
        });
      }
      return false; // Não propagar erro
    },
  });
}

/**
 * Hook para mutações (POST, PUT, PATCH, DELETE)
 */
export function useApiMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: MutationOptions<TData, TVariables> = {}
) {
  const queryClient = useQueryClient();
  const { checkRateLimit } = useSecurity();

  const {
    onSuccess,
    onError,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = "Operação realizada com sucesso",
    errorMessage,
  } = options;

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Verificar rate limiting
      if (!checkRateLimit("api_mutations", 20, 60 * 1000)) {
        throw new Error(
          "Rate limit excedido. Tente novamente em alguns minutos."
        );
      }

      return await mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if (showSuccessToast) {
        toastCustom.success({
          title: "Sucesso",
          description: successMessage,
        });
      }

      if (onSuccess) {
        onSuccess(data.data as TData, variables);
      }
    },
    onError: (error: Error, variables) => {
      if (showErrorToast) {
        toastCustom.error({
          title: "Erro",
          description: errorMessage || error.message || "Erro na operação",
        });
      }

      if (onError) {
        onError(error, variables);
      }
    },
  });
}

/**
 * Hook para requisições com loading state manual
 */
export function useApiCall<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { checkRateLimit } = useSecurity();

  const execute = useCallback(
    async (
      url: string,
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
      body?: any,
      options: { showToast?: boolean } = {}
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        // Verificar rate limiting
        if (!checkRateLimit("manual_api_calls", 30, 60 * 1000)) {
          throw new Error("Rate limit excedido");
        }

        let response: ApiResponse<T>;

        switch (method) {
          case "GET":
            response = await apiClient.get<T>(url);
            break;
          case "POST":
            response = await apiClient.post<T>(url, body);
            break;
          case "PUT":
            response = await apiClient.put<T>(url, body);
            break;
          case "PATCH":
            response = await apiClient.patch<T>(url, body);
            break;
          case "DELETE":
            response = await apiClient.delete<T>(url);
            break;
          default:
            throw new Error("Método HTTP não suportado");
        }

        if (response.success) {
          setData(response.data as T);

          if (options.showToast && method !== "GET") {
            toastCustom.success({
              title: "Sucesso",
              description: "Operação realizada com sucesso",
            });
          }

          return response.data;
        } else {
          throw new Error(response.error || "Erro na requisição");
        }
      } catch (err: any) {
        const errorMessage = err.message || "Erro desconhecido";
        setError(errorMessage);

        if (options.showToast) {
          toastCustom.error({
            title: "Erro",
            description: errorMessage,
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [checkRateLimit]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    reset,
    isLoading,
    error,
    data,
  };
}

/**
 * Hook para paginação de dados
 */
export function usePaginatedQuery<T = any>(
  baseKey: string,
  url: string,
  pageSize = 20
) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const queryKey = [baseKey, page, search, sortBy, sortOrder];

  const query = useApiQuery<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(
    queryKey,
    `${url}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
      search
    )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    {
      staleTime: 30 * 1000, // 30 segundos
    }
  );

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (query.data && page < query.data.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [query.data, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  }, [page]);

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset para primeira página
  }, []);

  const updateSort = useCallback(
    (field: string, order: "asc" | "desc" = "asc") => {
      setSortBy(field);
      setSortOrder(order);
      setPage(1); // Reset para primeira página
    },
    []
  );

  return {
    ...query,
    page,
    search,
    sortBy,
    sortOrder,
    goToPage,
    nextPage,
    prevPage,
    updateSearch,
    updateSort,
    hasNextPage: query.data ? page < query.data.totalPages : false,
    hasPrevPage: page > 1,
  };
}

/**
 * Hook para invalidar queries específicas
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidateQuery = useCallback(
    (key: string | string[]) => {
      queryClient.invalidateQueries({
        queryKey: Array.isArray(key) ? key : [key],
      });
    },
    [queryClient]
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const removeQuery = useCallback(
    (key: string | string[]) => {
      queryClient.removeQueries({
        queryKey: Array.isArray(key) ? key : [key],
      });
    },
    [queryClient]
  );

  return {
    invalidateQuery,
    invalidateAll,
    removeQuery,
  };
}

/**
 * Hook para debounce de requisições
 */
export function useDebouncedApi<T = any>(
  url: string,
  searchTerm: string,
  delay = 500
) {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);

  const query = useApiQuery<T>(
    ["search", url, debouncedTerm],
    `${url}?search=${encodeURIComponent(debouncedTerm)}`,
    {
      enabled: debouncedTerm.length > 2, // Só buscar com 3+ caracteres
    }
  );

  return {
    ...query,
    searchTerm: debouncedTerm,
    isSearching: searchTerm !== debouncedTerm,
  };
}
