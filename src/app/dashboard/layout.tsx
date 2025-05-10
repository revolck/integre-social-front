"use client";

import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardHeader, DashboardSidebar } from "@/theme";
import { Icon } from "@/components/ui/custom/Icons";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout específico para a seção de Dashboard
 *
 * Gerencia o estado do sidebar (colapsado/expandido)
 * Implementa responsividade e modo mobile
 * Integração com o sistema de temas
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Acesso ao tema atual
  const { theme } = useTheme();

  // Hook personalizado para detectar dispositivos móveis
  const isMobileDevice = useIsMobile();

  // Estados locais
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Alterna o estado de colapso do sidebar
   * Apenas funciona em dispositivos não-móveis
   */
  function toggleSidebar() {
    if (!isMobileDevice) {
      setIsCollapsed(!isCollapsed);
    } else {
      // Em dispositivos móveis, alterna o menu móvel
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  }

  // Efeito para manipulação do estado inicial e detecção de montagem
  useEffect(() => {
    setMounted(true);

    // Reset collapsed state when switching to mobile
    if (isMobileDevice && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [isMobileDevice, isCollapsed]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
      {/* Sidebar principal do dashboard */}
      <DashboardSidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isCollapsed={isCollapsed}
      />

      {/* Container principal de conteúdo */}
      <div className="w-full flex flex-1 flex-col">
        {/* Cabeçalho/barra superior */}
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23] flex items-center px-4">
          {/* Botão de toggle do sidebar */}
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <Icon name="Menu" size={20} />
          </button>

          {/* Título da página - pode ser dinâmico baseado na rota atual */}
          <h1 className="text-lg font-semibold">Dashboard</h1>

          {/* Espaço flexível */}
          <div className="flex-1"></div>

          {/* Ícones e controles de usuário na direita */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
              <Icon name="Bell" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Icon name="User" size={20} />
            </button>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto p-6 bg-white dark:bg-[#0F0F12]">
          {children}
        </main>
      </div>
    </div>
  );
}
