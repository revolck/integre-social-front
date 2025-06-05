"use client";

import { ReactNode, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { DashboardSidebar } from "@/theme";
import { Icon } from "@/components/ui/custom/Icons";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Layout específico para a seção de Dashboard
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
   */
  function toggleSidebar() {
    if (!isMobileDevice) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  }

  // Efeito para manipulação do estado inicial
  useEffect(() => {
    setMounted(true);

    // Reset collapsed state when switching to mobile
    if (isMobileDevice && isCollapsed) {
      setIsCollapsed(false);
    }

    // Adiciona classe ao body quando o menu está aberto em mobile
    // para evitar scroll
    if (isMobileMenuOpen && isMobileDevice) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDevice, isCollapsed, isMobileMenuOpen]);

  // Evita problemas de hidratação SSR
  if (!mounted) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className={`flex h-screen ${theme === "dark" ? "dark" : ""}`}>
        {/* Sidebar principal do dashboard */}
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isCollapsed={isCollapsed}
        />

      {/* Container principal de conteúdo */}
      <div className="w-full flex flex-1 flex-col transition-all duration-300 ease-in-out bg-[var(--sidebar-primary)]">
        {/* Cabeçalho/barra superior */}
        <header className="h-16 border-b border-[var(--sidebar-primary-border)] flex items-center px-4 bg-[var(--sidebar-primary)] z-10">
          {/* Botão de toggle do sidebar */}
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 text-white hover:text-[var(--sidebar-primary)] cursor-pointer transition-colors"
            aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            <Icon
              name={isCollapsed ? "ArrowRightFromLine" : "AlignLeft"}
              size={20}
              className="transition-transform duration-300"
            />
          </button>

          {/* Espaço flexível */}
          <div className="flex-1"></div>

          {/* Ícones e controles de usuário na direita */}
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-md hover:bg-gray-100 text-white hover:text-[var(--sidebar-primary)] cursor-pointer transition-colors relative">
              <Icon name="Bell" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button className="p-2 rounded-md hover:bg-gray-100 text-white hover:text-[var(--sidebar-primary)] cursor-pointer transition-colors">
              <Icon name="User" size={20} />
            </button>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto p-6 bg-[var(--background-body)] dark:bg-[var(--background)] ">
          {children}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  );
}
