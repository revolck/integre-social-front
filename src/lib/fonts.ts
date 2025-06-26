// src/lib/fonts.ts
import { Inter, JetBrains_Mono } from "next/font/google";

// Primeiro, chamamos os font loaders no escopo do módulo
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Depois criamos o objeto com as fontes
export const fonts = {
  sans: inter,
  mono: jetbrainsMono,
};
