import { cn } from "@/lib/utils";
import { MenuItem } from "./MenuItem";
import { MenuSectionProps } from "../../types/sidebar.types";

/**
 * Componente que renderiza uma seção do menu com título e itens
 *
 * Renderiza o título da seção e seus itens de menu
 * Oculta o título quando o sidebar está colapsado
 */
export function MenuSection({
  section,
  isCollapsed,
  handleNavigation,
}: MenuSectionProps) {
  return (
    <div className={cn("px-3", isCollapsed && "px-1")}>
      {/* Título da seção - visível apenas quando não está colapsado */}
      {!isCollapsed && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {section.title}
        </div>
      )}

      {/* Lista de itens desta seção */}
      <div className="space-y-1">
        {section.items.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            isCollapsed={isCollapsed}
            handleNavigation={handleNavigation}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
