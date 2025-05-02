"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { Button } from "@/components/ui/button";

interface ToggleSidebarButtonProps {
  collapsed: boolean;
  onClick: () => void;
  className?: string;
}

export const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({
  collapsed,
  onClick,
  className,
}) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn("p-0 h-8 w-8", className)}
      variant="ghost"
      size="icon"
      aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
    >
      <Icon name={collapsed ? "ChevronRight" : "ChevronLeft"} size={18} />
    </Button>
  );
};

export default ToggleSidebarButton;
