/**
 * Configuração centralizada da aplicação
 */

export const systemConfig = {
  name: "IntegreApp",
  description: "Solução completa para gestão empresarial e social",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://app.integreapp.com",
  authUrl: process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.integreapp.com",
  keywords: [
    "gestão",
    "social",
    "empresarial",
    "integração",
    "SaaS",
    "multitenant",
  ],
  version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",

  authors: [
    {
      name: "IntegreApp Team",
      url: "https://integreapp.com",
    },
  ],

  creator: "IntegreApp",

  // SEO e Meta Tags
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "IntegreApp - Gestão Integrada",
    description:
      "Solução completa para gestão empresarial e social com foco em sustentabilidade",
    siteName: "IntegreApp",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IntegreApp",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IntegreApp",
    description: "Solução completa para gestão empresarial e social",
    creator: "@integreapp",
    images: ["/og-image.png"],
  },

  // Configurações de SEO baseadas no ambiente
  robots: {
    index: process.env.NODE_ENV === "production",
    follow: process.env.NODE_ENV === "production",
    googleBot: {
      index: process.env.NODE_ENV === "production",
      follow: process.env.NODE_ENV === "production",
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Links importantes
  links: {
    github: "https://github.com/integreapp",
    docs: "https://docs.integreapp.com",
    support: "https://support.integreapp.com",
    api: "https://api.integreapp.com/docs",
  },

  // Configurações de desenvolvimento
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
