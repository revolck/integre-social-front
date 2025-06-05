import { Inter, JetBrains_Mono } from "next/font/google";

export const fonts = {
  sans: Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
  }),
  mono: JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
  }),
};
