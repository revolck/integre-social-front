// src/theme/sidebar/components/menu/MenuItem.tsx
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { MenuItemProps } from "../../types/sidebar.types";
import { toastCustom } from "@/components/ui/custom/toast"; // Importar toastCustom

/**
 * Componente que renderiza um item de menu individual
 */
export function MenuItem({
  item,
  isCollapsed,
  handleNavigation,
  level,
}: MenuItemProps) {
  // Estados locais
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Propriedades derivadas
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  // Refs
  const submenuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fecha o submenu quando clicado fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fecha submenu quando o sidebar é colapsado
  useEffect(() => {
    if (isCollapsed && isOpen) {
      setIsOpen(false);
    }
  }, [isCollapsed, isOpen]);

  // Limpa timeout quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Handler de navegação customizado com toast
  const handleItemNavigation = () => {
    // Chama o handler de navegação original
    handleNavigation();

    // Mostra uma notificação para determinadas seções
    if (item.href && !item.href.includes("#")) {
      // Apenas para links reais, não âncoras
      toastCustom.info({
        description: `Navegando para ${item.label}`,
        duration: 2000, // Toast rápido
        icon: item.icon ? <Icon name={item.icon} size={18} /> : undefined,
      });
    }
  };

  // Handlers
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsOpen(!isOpen);

      // Mostra toast quando abre ou fecha um submenu
      if (!isOpen && level === 0) {
        toastCustom.default({
          description: `Menu ${item.label} expandido`,
          duration: 1500,
        });
      }
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed && level === 0) {
      // Delay para evitar flickering
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  // Renderização condicional para estado colapsado
  if (isCollapsed && level === 0) {
    const menuContent = (
      <button
        onClick={hasSubmenu ? toggleSubmenu : handleItemNavigation}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative w-10 h-10 mx-auto my-1 flex items-center justify-center rounded-md transition-colors",
          item.active || isOpen
            ? "bg-primary/90 text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
        )}
      >
        {item.icon && <Icon name={item.icon} size={20} />}
      </button>
    );

    return (
      <div className="relative">
        {item.href && !hasSubmenu ? (
          <Link
            href={item.href}
            onClick={handleItemNavigation}
            className="block"
          >
            {menuContent}
          </Link>
        ) : (
          <div>{menuContent}</div>
        )}

        {/* Submenu popup para estado colapsado */}
        {hasSubmenu && (showTooltip || isOpen) && (
          <div
            ref={submenuRef}
            className={cn(
              "absolute left-full top-0 ml-2 w-48 rounded-md bg-white dark:bg-[#202024] shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50",
              "transform transition-opacity duration-200",
              isOpen
                ? "opacity-100"
                : showTooltip
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            style={{ marginTop: isOpen ? "0" : "-10px" }}
          >
            {/* Cabeçalho - muda de cor quando menu aberto */}
            <div
              className={cn(
                "flex items-center p-2 rounded-t-md",
                isOpen
                  ? "bg-indigo-500 text-white font-medium"
                  : "border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
              )}
            >
              {item.icon && (
                <Icon name={item.icon} size={16} className="mr-2" />
              )}
              <p className="text-sm">{item.label}</p>
            </div>

            {/* Items do submenu */}
            <div className="py-1">
              {item.submenu?.map((subItem) => (
                <div key={subItem.label} className="px-2 py-0.5">
                  {subItem.href ? (
                    <Link
                      href={subItem.href}
                      onClick={handleItemNavigation}
                      className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300"
                    >
                      {subItem.icon && (
                        <Icon
                          name={subItem.icon}
                          size={16}
                          className="mr-2 text-gray-500 dark:text-gray-400"
                        />
                      )}
                      <span>{subItem.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubmenu(e);
                      }}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center">
                        {subItem.icon && (
                          <Icon
                            name={subItem.icon}
                            size={16}
                            className="mr-2 text-gray-500 dark:text-gray-400"
                          />
                        )}
                        <span>{subItem.label}</span>
                      </div>
                      {subItem.submenu && (
                        <Icon
                          name="ChevronRight"
                          size={16}
                          className="text-gray-400"
                        />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Renderização padrão (não colapsada ou para submenus)
  return (
    <div className="relative">
      {item.href && !hasSubmenu ? (
        <Link
          href={item.href}
          onClick={handleItemNavigation}
          className={cn(
            "flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F23]",
            item.active
              ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-medium"
              : "text-gray-600 dark:text-gray-300",
            level > 0 && "text-xs"
          )}
        >
          {item.icon && (
            <Icon name={item.icon} size={16} className="mr-3 flex-shrink-0" />
          )}
          <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
        </Link>
      ) : (
        <button
          onClick={toggleSubmenu}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F23]",
            isOpen
              ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-300",
            level > 0 && "text-xs"
          )}
        >
          <div className="flex items-center">
            {item.icon && (
              <Icon name={item.icon} size={16} className="mr-3 flex-shrink-0" />
            )}
            <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
          </div>
          {hasSubmenu && (
            <div className="flex items-center">
              {isOpen ? (
                <Icon name="ChevronUp" size={16} />
              ) : (
                <Icon name="ChevronDown" size={16} />
              )}
            </div>
          )}
        </button>
      )}

      {/* Renderização recursiva de submenu */}
      {hasSubmenu && isOpen && (
        <div
          ref={submenuRef}
          className={cn(
            "mt-1 pl-4 border-l border-gray-200 dark:border-gray-700",
            "overflow-hidden"
          )}
        >
          {item.submenu?.map((subItem) => (
            <MenuItem
              key={subItem.label}
              item={subItem}
              isCollapsed={isCollapsed}
              handleNavigation={handleNavigation}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
