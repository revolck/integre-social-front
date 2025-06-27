import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
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
 * Configura o tema, elementos globais e estrutura básica
 * Implementa ThemeProvider para suporte ao modo claro/escuro
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Meta tags e outros elementos de cabeçalho são gerenciados pelo Next.js */}
      </head>
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Container centralizado de notificações do sistema */}
          <ToasterCustom
            position="top-right"
            theme="system"
            richColors={true}
            closeButton={false}
            maxToasts={5}
            gap={8}
            defaultDuration={5000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
