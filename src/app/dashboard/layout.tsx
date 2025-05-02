"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/theme/header";
import { DashboardSidebar } from "@/theme/sidebar";
import { ToggleSidebarButton } from "@/theme/sidebar/ToggleSidebarButton";
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
      {/* Header - usando o componente existente */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar collapsed={collapsed} />

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Barra de título da página com toggle do sidebar */}
          <div className="flex h-12 items-center border-b px-4 bg-background">
            <div className="flex items-center">
              <ToggleSidebarButton
                collapsed={collapsed}
                onClick={toggleCollapse}
                className="mr-4"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
