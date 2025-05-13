// src/theme/sidebar/modules/project-selector/components/ProjectAvatar.tsx
"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Project } from "../types/project.types";

interface ProjectAvatarProps {
  project: Project;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  isSelected?: boolean;
  showInitials?: boolean; // Nova prop para mostrar iniciais
}

/**
 * Componente para renderizar o avatar de um projeto
 */
export function ProjectAvatar({
  project,
  size = "md",
  className = "",
  isSelected = false,
  showInitials = true, // Por padrão, mostra iniciais
}: ProjectAvatarProps) {
  // Configuração de tamanhos
  const sizeConfigs = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  // Extrai cores com base no ID do projeto (para consistência)
  const getAvatarColor = (id: string) => {
    const colors = {
      "1": "bg-blue-900/80 text-blue-200", // IA
      "2": "bg-green-900/80 text-green-200", // Instituto Amigos
      "3": "bg-purple-900/80 text-purple-200", // TS
      "4": "bg-green-900/80 text-green-200", // Global
      "5": "bg-teal-900/80 text-teal-200", // HI
      // Default para projetos com outros IDs
      default: "bg-gray-800 text-gray-200",
    };

    return colors[id as keyof typeof colors] || colors.default;
  };

  /**
   * Extrai as iniciais do nome do projeto
   * Para projetos com múltiplas palavras, usa as iniciais das duas primeiras
   */
  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase();
  };

  return (
    <div
      className={cn(
        sizeConfigs[size],
        "flex items-center justify-center rounded-md overflow-hidden transition-all",
        isSelected ? "ring-2 ring-blue-600" : "",
        className
      )}
    >
      {project.logoUrl ? (
        <div className="w-full h-full relative">
          <Image
            src={project.logoUrl}
            alt={project.name}
            fill
            className="object-cover"
            sizes={`(max-width: 768px) ${sizeConfigs[size].split(" ")[0]}, ${
              sizeConfigs[size].split(" ")[0]
            }`}
          />
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center font-medium",
            getAvatarColor(project.id)
          )}
        >
          {showInitials && getInitials(project.name)}
        </div>
      )}
    </div>
  );
}
