"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon, IconName } from "@/components/ui/custom/Icons";

interface SidebarMenuItemProps {
  href: string;
  icon?: IconName;
  title: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  badge?: React.ReactNode;
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  href,
  icon,
  title,
  active = false,
  onClick,
  className,
  badge,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg__royal-blue text-white"
          : "text-foreground hover:bg__royal-blue hover:bg-opacity-20",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <Icon name={icon} size={18} />}
        <span>{title}</span>
      </div>
      {badge && <div>{badge}</div>}
    </Link>
  );
};

export default SidebarMenuItem;
