import type { Metadata } from "next";
import { AppProvider } from "@/providers";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { siteConfig } from "@/config/site";
import { generateCSP } from "@/lib/security/csp";
import { fonts } from "@/lib/fonts";
import "@/styles/globals.css";
import "@/styles/theme.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  viewport: "width=device-width, initial-scale=1",
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  robots: siteConfig.robots,
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
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fonts.sans.variable} ${fonts.mono.variable}`}
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={generateCSP()} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <SecurityHeaders />
        <ErrorBoundary>
          <AppProvider>
            <main className="flex-1 flex flex-col">{children}</main>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
