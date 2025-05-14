import { useState, useEffect, useMemo } from "react";
import { MenuSection } from "./MenuSection";
import { useActiveRoute } from "@/hooks/useActiveRoute";
import type { MenuSection as MenuSectionType } from "../../types/sidebar.types";

interface MenuListProps {
  sections: MenuSectionType[];
  isCollapsed: boolean;
  handleNavigation: () => void;
}

/**
 * Componente que renderiza a lista completa de seções do menu
 *
 * Agrupa todas as seções do menu e as renderiza
 * Processa as seções para marcar itens ativos com base na URL
 */
export function MenuList({
  sections,
  isCollapsed,
  handleNavigation,
}: MenuListProps) {
  // Utiliza o hook de rota ativa
  const { markActiveItems, pathname, ready } = useActiveRoute();

  // Processa as seções do menu com useMemo para evitar recálculos desnecessários
  const processedSections = useMemo(() => {
    if (!ready) return sections;

    // Processa as seções do menu e marca os itens ativos
    return sections.map((section) => ({
      ...section,
      items: markActiveItems(section.items),
    }));
  }, [sections, markActiveItems, ready, pathname]);

  return (
    <div className="space-y-6">
      {processedSections.map((section) => (
        <MenuSection
          key={section.title}
          section={section}
          isCollapsed={isCollapsed}
          handleNavigation={handleNavigation}
        />
      ))}
    </div>
  );
}
