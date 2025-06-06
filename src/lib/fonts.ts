import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Os carregadores de fontes do Next.js devem ser executados
 * diretamente no escopo do módulo. Caso contrário o build lança
 * um erro informando que o loader precisa ser atribuído a uma
 * constante. Para seguir essa regra, criamos duas constantes
 * (`inter` e `jetBrainsMono`) e as exportamos através do objeto
 * `fonts`.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const fonts = {
  sans: inter,
  mono: jetBrainsMono,
};
