"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/theme/header";
import { DashboardSidebar } from "@/theme/sidebar";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { collapsed, toggleCollapse } = useSidebarCollapse();
  const pathname = usePathname();
  const router = useRouter();

  // Se estiver na pasta raiz do dashboard, redirecionar para analytics
  useEffect(() => {
    if (pathname === "/dashboard") {
      router.replace("/dashboard/analytics");
    }
  }, [pathname, router]);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header - recebe o estado do sidebar e a função de toggle */}
      <DashboardHeader collapsed={collapsed} toggleCollapse={toggleCollapse} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar collapsed={collapsed} />

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Área de conteúdo com scroll */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
