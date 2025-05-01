"use client";
import React from "react";

interface Shade {
  suffix: string;
  rating: string;
}
interface Section {
  varName: string;
  title: string;
  subtitle: string;
  description: string;
  shades: Shade[];
}

// Todas as cores do seu globals.css
const sections: Section[] = [
  {
    varName: "gray",
    title: "Cinza",
    subtitle: "(gray)",
    description: "Cor neutra para fundos e bordas.",
    shades: [],
  },
  {
    varName: "purple",
    title: "Roxo",
    subtitle: "(purple)",
    description: "Cor semântica primária secundária.",
    shades: [],
  },
  {
    varName: "pink-light",
    title: "Rosa Claro",
    subtitle: "(pink-light)",
    description: "Cor de destaque suave.",
    shades: [],
  },
  {
    varName: "yellow",
    title: "Amarelo",
    subtitle: "(yellow)",
    description: "Avisos de atenção leve.",
    shades: [],
  },
  {
    varName: "lavender",
    title: "Lavanda",
    subtitle: "(lavender)",
    description: "Variante suave para fundos e destaques.",
    shades: [],
  },
  {
    varName: "teal",
    title: "Verde Água",
    subtitle: "(teal)",
    description: "Cor de sucesso ou confirmação.",
    shades: [],
  },
  {
    varName: "blue",
    title: "Azul",
    subtitle: "(blue)",
    description: "Cor principal do sistema, usada em ações primárias.",
    shades: [],
  },
  {
    varName: "cyan",
    title: "Ciano",
    subtitle: "(cyan)",
    description: "Notificações de informação.",
    shades: [],
  },
  {
    varName: "black",
    title: "Preto",
    subtitle: "(black)",
    description: "Texto principal e elementos escuros.",
    shades: [],
  },
  {
    varName: "gray-dark",
    title: "Cinza Escuro",
    subtitle: "(gray-dark)",
    description: "Fundos escuros e bordas sutis.",
    shades: [],
  },
];

// Gera automaticamente as 9 variações de cada cor
const suffixes = [
  "--d40",
  "--d30",
  "--d20",
  "--d10",
  "",
  "--l10",
  "--l20",
  "--l30",
  "--l40",
];
sections.forEach((sec) => {
  sec.shades = suffixes.map((s) => ({
    suffix: s,
    rating: ["--d40", "--d30", "--d20", "--l30", "--l40"].includes(s)
      ? "AAA"
      : ["--d10", "", "--l10", "--l20"].includes(s)
      ? "AA"
      : "AAA",
  }));
});

export default function ColorsPage() {
  return (
    <div className="p-8 space-y-12">
      {sections.map((sec) => (
        <section key={sec.varName} className="space-y-4">
          <h2 className="text-2xl font-bold">
            {sec.title}{" "}
            <span className="text-sm text-muted-foreground">
              {sec.subtitle}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">{sec.description}</p>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr>
                  {sec.shades.map((shade) => (
                    <th
                      key={shade.suffix}
                      className="px-3 py-1 text-xs font-mono text-center border-b"
                    >
                      {shade.suffix || "base"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Swatch + rating */}
                <tr>
                  {sec.shades.map((shade) => {
                    const bg = `bg__${sec.varName}${shade.suffix}`;
                    const tx = `tx__${sec.varName}${shade.suffix}`;
                    return (
                      <td
                        key={shade.suffix}
                        className={`p-2 border ${bg} text-center`}
                      >
                        <span className={`${tx} font-semibold`}>
                          {shade.rating}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                {/* Classe para texto */}
                <tr>
                  {sec.shades.map((shade) => (
                    <td key={shade.suffix} className="p-1 border text-center">
                      <code className="text-xs bg-pink-50 text-pink-600 px-1 rounded">
                        .tx__{sec.varName}
                        {shade.suffix}
                      </code>
                    </td>
                  ))}
                </tr>
                {/* Classe para background */}
                <tr>
                  {sec.shades.map((shade) => (
                    <td key={shade.suffix} className="p-1 border text-center">
                      <code className="text-xs bg-pink-50 text-pink-600 px-1 rounded">
                        .bg__{sec.varName}
                        {shade.suffix}
                      </code>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
