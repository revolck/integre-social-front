"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/custom/Icons";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";

interface MenuItemProps {
  id: string;
  href: string;
  label: string;
  icon: string;
  active: boolean;
  collapsed: boolean;
  hovered?: boolean;
}

const MenuItem = ({
  href,
  label,
  icon,
  active,
  id,
  collapsed,
  hovered = false,
}: MenuItemProps) => {
  const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();

  return (
    <Button
      variant={active ? "default" : "ghost"}
      className={cn("relative h-auto py-3 px-3 justify-start w-full", {
        "hover:ring-transparent hover:ring-offset-0": !active,
      })}
      asChild
      size={collapsed && !hovered ? "icon" : "default"}
    >
      <Link
        href={href}
        onClick={() =>
          setMobileMenuConfig({ ...mobileMenuConfig, isOpen: false })
        }
      >
        <Icon
          name={icon as keyof typeof LucideIcons}
          className={cn("h-5 w-5", {
            "me-2": !collapsed || hovered,
          })}
        />
        {(!collapsed || hovered) && (
          <p className="max-w-[200px] truncate">{label}</p>
        )}
      </Link>
    </Button>
  );
};

export default MenuItem;
