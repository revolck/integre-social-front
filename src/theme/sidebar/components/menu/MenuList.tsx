import { MenuSection } from "./MenuSection";
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
 * Responsável apenas pela iteração das seções
 */
export function MenuList({
  sections,
  isCollapsed,
  handleNavigation,
}: MenuListProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
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
