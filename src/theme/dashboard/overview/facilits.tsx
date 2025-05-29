"use client";

import React from "react";
import { CardButtonGroup } from "@/components/ui/custom/card-button";
import type { IconName } from "@/components/ui/custom/Icons";

const quickActions: Array<{
  icon: IconName; // ✅ Tipagem forte
  label: string;
  onClick?: () => void;
}> = [
  {
    icon: "Users",
    label: "Cadastrar beneficiado",
    onClick: () => console.log("Cadastrar beneficiado"),
  },
  {
    icon: "Search",
    label: "Pesquisar beneficiado",
    onClick: () => console.log("Pesquisar beneficiado"),
  },
  {
    icon: "LineChart",
    label: "Visualizar indicadores",
    onClick: () => console.log("Visualizar indicadores"),
  },
  {
    icon: "FileText",
    label: "Gerar relatórios",
    onClick: () => console.log("Gerar relatórios"),
  },
  {
    icon: "MapPin",
    label: "Visualizar mapa social",
    onClick: () => console.log("Visualizar mapa social"),
  },
];

export default function Facilits() {
  return (
    <div className="mb-8">
      <CardButtonGroup
        buttons={quickActions}
        variant="default"
        size="default"
      />
    </div>
  );
}
