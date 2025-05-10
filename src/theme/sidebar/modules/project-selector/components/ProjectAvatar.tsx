import Image from "next/image";
import type { Project } from "../types/project.types";

interface ProjectAvatarProps {
  project: Project;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Componente que renderiza o avatar do projeto
 *
 * Exibe a logo do projeto se disponível, ou as iniciais do nome como fallback
 * Suporta diferentes tamanhos através da prop size
 */
export function ProjectAvatar({
  project,
  size = "md",
  className = "",
}: ProjectAvatarProps) {
  // Configuração de tamanhos responsivos
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
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
    <>
      {project.logoUrl ? (
        <div
          className={`relative ${sizeClasses[size]} rounded-md overflow-hidden ${className}`}
        >
          <Image
            src={project.logoUrl}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {getInitials(project.name)}
          </span>
        </div>
      )}
    </>
  );
}
