"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SidebarSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  children,
  className,
}) => {
  return (
    <div className={cn("mb-4", className)}>
      {title && (
        <h3 className="mb-2 px-3 text-xs font-medium uppercase text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export default SidebarSection;
