"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";

interface SidebarContentProps {
  children: React.ReactNode;
  collapsed: boolean;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}

const SidebarContent = ({
  children,
  collapsed,
  onHoverStart,
  onHoverEnd,
}: SidebarContentProps) => {
  const [hoverConfig] = useMenuHoverConfig();

  return (
    <aside
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={cn(
        "fixed z-50 bg-sidebar shadow-base xl:block hidden h-full start-0",
        collapsed && !hoverConfig.hovered ? "w-[72px]" : "w-[248px]",
        "transition-all duration-300"
      )}
    >
      <div className="relative flex flex-col h-full">{children}</div>
    </aside>
  );
};

export default SidebarContent;
