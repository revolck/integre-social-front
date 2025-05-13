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
}

/**
 * Componente aprimorado para renderizar o avatar de um projeto
 *
 * Características:
 * - Suporte a diferentes tamanhos
 * - Efeitos visuais para seleção
 * - Fallback para iniciais quando não há logo
 * - Animações suaves
 */
export function ProjectAvatar({
  project,
  size = "md",
  className = "",
  isSelected = false,
}: ProjectAvatarProps) {
  // Configuração de tamanhos responsivos
  const sizeConfigs = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  };

  // Extrai cores do nome do projeto para avatares sem logo
  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-blue-500 text-white",
      "bg-purple-500 text-white",
      "bg-teal-500 text-white",
      "bg-pink-500 text-white",
      "bg-amber-500 text-white",
      "bg-emerald-500 text-white",
      "bg-indigo-500 text-white",
    ];

    // Use a soma dos códigos de caractere para escolher a cor
    const charSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  /**
   * Extrai as iniciais do nome do projeto
   * Para projetos com múltiplas palavras, usa as iniciais das duas primeiras
   * Para projetos com uma palavra, usa as duas primeiras letras
   */
  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div
      className={cn(
        sizeConfigs[size],
        "relative rounded-md overflow-hidden transition-all duration-300",
        isSelected &&
          "ring-2 ring-blue-500 ring-offset-2 ring-offset-background",
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
            "w-full h-full flex items-center justify-center",
            getBackgroundColor(project.name)
          )}
        >
          <span className="font-medium">{getInitials(project.name)}</span>
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
