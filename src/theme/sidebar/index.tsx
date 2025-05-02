"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Basic sidebar navigation item type
type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

// Props for the sidebar component
interface SidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  // Navigation items for the sidebar
  const navItems: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart2 size={20} />,
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users size={20} />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t">
        <Link
          href="/help"
          className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <HelpCircle size={18} />
          <span>Help & Support</span>
        </Link>
      </div>
    </div>
  );
}

export default DashboardSidebar;
