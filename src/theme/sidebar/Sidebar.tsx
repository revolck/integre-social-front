import { cn } from "@/lib/utils";
import { SidebarHeader } from "./components/header/SidebarHeader";
import { ProjectSelector } from "./modules/project-selector";
import { MenuList } from "./components/menu/MenuList";
import { useSidebarNavigation } from "./hooks/useSidebarNavigation";
import { menuSections } from "./config/menuConfig";
import type { SidebarProps } from "./types/sidebar.types";
// Remover importação: import { ToasterCustom } from "@/components/ui/custom/toast";

/**
 * Componente principal do Sidebar
 *
 * Organiza a estrutura geral e coordena os diferentes componentes
 * Implementa a infraestrutura do sidebar e estado mobile/collapsed
 */
export function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed,
}: SidebarProps) {
  // Hook para navegação
  const { handleNavigation } = useSidebarNavigation(setIsMobileMenuOpen);

  return (
    <>
      {/* Container principal do sidebar */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 bg-white dark:bg-[#0F0F12] transform transition-all duration-200 ease-in-out",
          "lg:translate-x-0 lg:static border-r border-gray-200 dark:border-[#1F1F23] overflow-hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Cabeçalho do Sidebar */}
          <SidebarHeader
            isCollapsed={isCollapsed}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />

          {/* Seletor de Projetos */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
            <ProjectSelector isCollapsed={isCollapsed} />
          </div>

          {/* Conteúdo do Menu */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <MenuList
              sections={menuSections}
              isCollapsed={isCollapsed}
              handleNavigation={handleNavigation}
            />
          </div>
        </div>
      </nav>

      {/* Overlay móvel - escurece a tela quando o menu está aberto em dispositivos móveis */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
