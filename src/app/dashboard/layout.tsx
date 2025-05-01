"use client";

import React from "react";
import { DashboardHeader } from "@/theme/header";
import { DashboardSidebar } from "@/theme/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray overflow-y-auto">
          {/* This is where page content will be rendered */}
          {children}
        </main>
      </div>
    </div>
  );
}
