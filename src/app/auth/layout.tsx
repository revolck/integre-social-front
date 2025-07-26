"use client";

import React from "react";

/**
 * Layout para páginas de autenticação
 *
 * Removido ThemeProvider - aplicação apenas em modo claro
 * Mantém estrutura limpa e focada na experiência de login
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-background text-foreground">
      {children}
    </section>
  );
}
