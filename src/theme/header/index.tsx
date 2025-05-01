"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DarkTheme } from "@/components/partials/darkTheme/darkTheme";
import Image from "next/image";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo-white.svg"
            alt="DashCode"
            width={130}
            height={45}
            className="dark:invert transition-all duration-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <DarkTheme />

        {/* User profile button */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <span className="sr-only">User menu</span>
          <div className="h-8 w-8 rounded-full bg-muted"></div>
        </Button>
      </div>
    </header>
  );
}

// Export component as default for easier imports
export default DashboardHeader;
