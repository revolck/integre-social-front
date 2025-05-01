"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Basic sidebar navigation item type
type SidebarNavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  isActive?: boolean;
};

// Props for the sidebar component
interface SidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: SidebarProps) {
  // This is just structural - in a real implementation, you would likely
  // determine active state based on current route

  return (
    <div
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {/* Dashboard Navigation Item */}
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent text-accent-foreground"
              >
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Analytics Navigation Item */}
            <li>
              <Link
                href="/analytics"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <span>Analytics</span>
              </Link>
            </li>

            {/* Additional navigation items would go here */}
          </ul>
        </nav>
      </div>
    </div>
  );
}
