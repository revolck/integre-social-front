"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users, MapPin, LineChart } from "lucide-react";

// Improve Quick Actions - Remove Export Data option
const quickActions = [
  { icon: <Users className="h-5 w-5" />, label: "Novo Cadastro" },
  { icon: <LineChart className="h-5 w-5" />, label: "Indicadores" },
  { icon: <LineChart className="h-5 w-5" />, label: "Relatórios" },
  { icon: <MapPin className="h-5 w-5" />, label: "Mapa Social" },
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
      className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all group"
      onClick={onClick}
    >
      <div className="bg-blue-100 text-blue-600 p-3 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};
