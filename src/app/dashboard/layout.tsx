"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardHeader } from "@/theme/header";
import { DashboardSidebar } from "@/theme/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Se estiver na pasta raiz do dashboard, redirecionar para analytics
  useEffect(() => {
    if (pathname === "/dashboard") {
      router.replace("/dashboard/analytics");
    }
  }, [pathname, router]);

  return (
    <div className="relative min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* Área onde o conteúdo da página será renderizado */}
          {children}
        </main>
      </div>
    </div>
  );
}
