import type { Metadata } from "next";
import { ToasterCustom } from "@/components/ui/custom/toast";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "IntegreApp - Plataforma de Gestão Integrada",
  description: "Solução completa para gestão empresarial e social",
  viewport: "width=device-width, initial-scale=1",
};

/**
 * Layout principal da aplicação
 *
 * Configura elementos globais e estrutura básica
 * Removido ThemeProvider - aplicação apenas em modo claro
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Meta tags e outros elementos de cabeçalho são gerenciados pelo Next.js */}
      </head>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground">
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Container centralizado de notificações do sistema */}
        <ToasterCustom
          position="top-right"
          theme="light"
          richColors={true}
          closeButton={false}
          maxToasts={5}
          gap={8}
          defaultDuration={5000}
        />
      </body>
    </html>
  );
}
