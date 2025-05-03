"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarHoverToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

const SidebarHoverToggle = ({
  collapsed,
  onToggle,
}: SidebarHoverToggleProps) => {
  const [hoverConfig] = useMenuHoverConfig();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (!isDesktop) {
    return null;
  }

  return !collapsed || hoverConfig.hovered ? (
    <div
      onClick={onToggle}
      className={cn(
        "h-4 w-4 border-[1.5px] border-default-900 dark:border-default-700 rounded-full transition-all duration-150 cursor-pointer",
        {
          "ring-2 ring-inset ring-offset-4 ring-black-900 dark:ring-default-400 bg-default-900 dark:bg-default-400 dark:ring-offset-default-700":
            !collapsed,
        }
      )}
    ></div>
  ) : null;
};

export default SidebarHoverToggle;
