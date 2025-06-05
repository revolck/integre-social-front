import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { RootProvider } from "@/providers/root-provider";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { systemConfig } from "@/config/system";
import { generateCSP } from "@/config/security";
import "@/styles/globals.css";

// Configuração de fontes otimizada
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false, // Carregar apenas quando necessário
});

// Metadata dinâmica e segura
export const metadata: Metadata = {
  title: {
    default: systemConfig.name,
    template: `%s | ${systemConfig.name}`,
  },
  description: systemConfig.description,
  keywords: systemConfig.keywords,
  authors: systemConfig.authors,
  creator: systemConfig.creator,

  // Open Graph
  openGraph: {
    ...systemConfig.openGraph,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: systemConfig.name,
      },
    ],
  },

  // Twitter
  twitter: systemConfig.twitter,

  // Robots
  robots: systemConfig.robots,

  // Security headers via metadata
  other: {
    "X-DNS-Prefetch-Control": "on",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  },

  // Verificação de domínio (se necessário)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },

  // Alternate languages
  alternates: {
    canonical: systemConfig.url,
    languages: {
      "pt-BR": systemConfig.url,
      "en-US": `${systemConfig.url}/en`,
      "es-ES": `${systemConfig.url}/es`,
    },
  },

  // App specific
  applicationName: systemConfig.name,
  generator: "Next.js",

  // Icons
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#000000" },
    ],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // No index em desenvolvimento
  ...(process.env.NODE_ENV === "development" && {
    robots: {
      index: false,
      follow: false,
    },
  }),
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
  colorScheme: "light dark",
};

/**
 * Layout raiz da aplicação
 *
 * Responsabilidades:
 * - Configurar providers globais
 * - Aplicar fonts e estilos globais
 * - Configurar headers de segurança
 * - Implementar error boundary
 * - Configurar analytics e monitoramento
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Security Headers */}
        <SecurityHeaders />

        {/* Content Security Policy */}
        <meta httpEquiv="Content-Security-Policy" content={generateCSP()} />

        {/* DNS Prefetch para domínios externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />

        {/* Preconnect para recursos críticos */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Service Worker Registration */}
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        )}
      </head>

      <body
        className="min-h-screen bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        {/* Error Boundary global */}
        <ErrorBoundary>
          {/* Provider raiz que engloba todos os outros */}
          <RootProvider>
            {/* Container principal */}
            <div className="relative flex min-h-screen flex-col">
              {/* Conteúdo da aplicação */}
              <main className="flex-1">{children}</main>
            </div>
          </RootProvider>
        </ErrorBoundary>

        {/* Analytics scripts (apenas em produção) */}
        {process.env.NODE_ENV === "production" && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}

            {/* Hotjar */}
            {process.env.NEXT_PUBLIC_HOTJAR_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                      h._hjSettings={hjid:${process.env.NEXT_PUBLIC_HOTJAR_ID},hjsv:6};
                      a=o.getElementsByTagName('head')[0];
                      r=o.createElement('script');r.async=1;
                      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                      a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}
