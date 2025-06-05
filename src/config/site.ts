export const siteConfig = {
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
} as const;
