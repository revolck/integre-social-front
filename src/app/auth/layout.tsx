"use client";

import React from "react";
import { AppProvider } from "@/providers";
import "@/styles/globals.css";
import "@/styles/theme.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen">
      <AppProvider defaultTheme="light">{children}</AppProvider>
    </section>
  );
}
