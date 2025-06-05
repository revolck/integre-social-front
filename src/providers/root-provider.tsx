"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./auth-provider";
import { AppProvider } from "./app-provider";
import { ToasterCustom } from "@/components/ui/custom/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface RootProviderProps {
  children: React.ReactNode;
}

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // Não fazer retry em erros de autenticação
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Não fazer retry em erros de validação ou autenticação
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

/**
 * Provider raiz que engloba todos os outros providers
 * Centraliza a configuração de contextos globais da aplicação
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    // Query Client para gerenciamento de estado do servidor
    <QueryClientProvider client={queryClient}>
      {/* Provider de tema (dark/light mode) */}
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
        storageKey="integreapp-theme"
      >
        {/* Provider de autenticação */}
        <AuthProvider>
          {/* Provider da aplicação (configurações, organização, etc.) */}
          <AppProvider>
            {/* Conteúdo da aplicação */}
            {children}

            {/* Sistema de notificações global */}
            <ToasterCustom
              position="top-right"
              theme="system"
              richColors={true}
              closeButton={true}
              maxToasts={5}
              gap={12}
              defaultDuration={4000}
              visibleToasts={5}
              expand={true}
              pauseWhenPageIsHidden={true}
              className="toaster-custom"
            />
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>

      {/* React Query Devtools apenas em desenvolvimento */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

/**
 * Hook para acessar o QueryClient
 */
export { useQueryClient } from "@tanstack/react-query";
