"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon, IconName } from "@/components/ui/custom/Icons";
import { SidebarMenuItem } from "./SidebarMenuItem";

interface SubMenuItem {
  href: string;
  title: string;
  active?: boolean;
}

interface SidebarSubMenuProps {
  icon?: IconName;
  title: string;
  items: SubMenuItem[];
  defaultOpen?: boolean;
  className?: string;
}

export const SidebarSubMenu: React.FC<SidebarSubMenuProps> = ({
  icon,
  title,
  items,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveItem = items.some((item) => item.active);

  // Se algum item estiver ativo, abra o submenu automaticamente
  React.useEffect(() => {
    if (hasActiveItem && !isOpen) {
      setIsOpen(true);
    }
  }, [hasActiveItem, isOpen]);

  return (
    <div className={cn("space-y-1", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
          hasActiveItem
            ? "bg__royal-blue text-white"
            : "text-foreground hover:bg__royal-blue hover:bg-opacity-20"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <Icon name={icon} size={18} />}
          <span>{title}</span>
        </div>
        <Icon
          name={isOpen ? "ChevronUp" : "ChevronDown"}
          size={16}
          className={cn(
            "transition-transform",
            hasActiveItem ? "text-white" : "text-muted-foreground"
          )}
        />
      </button>

      {isOpen && (
        <div className="ml-5 pl-3 border-l border-border">
          {items.map((item, index) => (
            <SidebarMenuItem
              key={`${item.href}-${index}`}
              href={item.href}
              title={item.title}
              active={item.active}
              className="py-1.5"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarSubMenu;
