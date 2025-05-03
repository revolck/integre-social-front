"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { MenuDragAble } from "./menu/menu-dragable";

interface DashboardSidebarProps {
  collapsed: boolean;
}

export function DashboardSidebar({ collapsed }: DashboardSidebarProps) {
  const [hoverConfig, setHoverConfig] = useMenuHoverConfig();

  return (
    <aside
      onMouseEnter={() => setHoverConfig({ hovered: true })}
      onMouseLeave={() => setHoverConfig({ hovered: false })}
      className={cn(
        "fixed z-50 bg-sidebar shadow-base xl:block hidden h-full start-0",
        "transition-all duration-300",
        collapsed && !hoverConfig.hovered ? "w-[72px]" : "w-[248px]"
      )}
    >
      <div className="relative flex flex-col h-full">
        <MenuDragAble collapsed={collapsed} />
      </div>
    </aside>
  );
}

export default DashboardSidebar;
