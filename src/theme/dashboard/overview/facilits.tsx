"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users, MapPin, LineChart, Search } from "lucide-react";

// Improve Quick Actions - Remove Export Data option
const quickActions = [
  { icon: <Users className="h-5 w-5" />, label: "Cadastrar beneficiado" },
  { icon: <Search className="h-5 w-5" />, label: "Pesquisar beneficiado" },
  { icon: <LineChart className="h-5 w-5" />, label: "Visualizar indicadores" },
  { icon: <LineChart className="h-5 w-5" />, label: "Gerar relatórios" },
  { icon: <MapPin className="h-5 w-5" />, label: "Visualizar mapa social" },
];

export default function Facilits() {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickActions.map((action, index) => (
          <ActionButton key={index} icon={action.icon} label={action.label} />
        ))}
      </div>
    </div>
  );
}

// Action Button Component
const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <Button
      variant="outline"
      className="h-auto py-4 px-4 shadow-none border border-[var(--global-terciary)] flex flex-col items-center justify-center gap-2 bg-[var(--global-secondary)] hover:bg-[var(--global-secondary-hover)] transition-all duration-200 group disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-[var(--global-terciary)] text-[var(--global-title)] p-3 rounded-full group-hover:bg-[var(--global-terciary-hover)] group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};
