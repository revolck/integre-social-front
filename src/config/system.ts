export const systemConfig = {
  name: "IntegreApp",
  description: "Solução completa para gestão empresarial e social",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://app.integreapp.com",
  keywords: ["gestão", "social", "empresarial", "integração"],
  authors: [
    {
      name: "IntegreApp Team",
      url: "https://integreapp.com",
    },
  ],
  creator: "IntegreApp",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "IntegreApp",
    description: "Solução completa para gestão empresarial e social",
    siteName: "IntegreApp",
  },
  twitter: {
    card: "summary_large_image",
    title: "IntegreApp",
    description: "Solução completa para gestão empresarial e social",
    creator: "@integreapp",
  },
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
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.integreapp.com/v1",
    timeout: process.env.NEXT_PUBLIC_API_TIMEOUT || "30000",
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    notifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === "true",
    websocket: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === "true",
    debug: process.env.NEXT_PUBLIC_DEBUG === "true",
    mockApi: process.env.NEXT_PUBLIC_MOCK_API === "true",
  },
} as const;
