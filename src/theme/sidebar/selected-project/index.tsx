"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjects";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Tipos para os projetos
export interface Project {
  id: string;
  name: string;
  logo?: string;
  initials?: string;
  color?: string;
  description?: string;
}

interface SelectedProjectProps {
  className?: string;
  collapsed?: boolean;
}

export const SelectedProject = ({
  className,
  collapsed = false,
}: SelectedProjectProps) => {
  // Usando o hook customizado para gerenciar projetos
  const { projects, currentProject, loading, changeProject } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  // Função para lidar com a mudança de projeto
  const handleProjectChange = (value: string) => {
    const newProject = projects.find((p) => p.id === value);
    if (newProject) {
      changeProject(newProject);
    }
  };

  // Truncate description function
  const truncateText = (text: string, maxLength: number = 15) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Se estiver carregando, exibir um skeleton
  if (loading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          {!collapsed && (
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Se não houver projetos, exibir mensagem
  if (projects.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        {!collapsed ? (
          <div className="text-sm text-muted-foreground">
            Nenhum projeto encontrado
          </div>
        ) : (
          <Avatar className="h-10 w-10">
            <AvatarFallback>N/A</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  // Quando colapsado, apenas mostrar o avatar/logo do projeto selecionado
  if (collapsed) {
    return (
      <div className={cn("py-4 px-3 flex justify-center", className)}>
        {currentProject && (
          <Avatar className="h-10 w-10">
            {currentProject.logo ? (
              <AvatarImage
                src={currentProject.logo}
                alt={currentProject.name}
              />
            ) : (
              <AvatarFallback
                className={cn(
                  "text-white",
                  currentProject.color || "bg-gray-600"
                )}
              >
                {currentProject.initials || currentProject.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </div>
    );
  }

  // Default description se não houver uma
  const description = currentProject?.description || "Designing Workspace";

  // Versão expandida (não colapsada)
  return (
    <div className={cn("py-4 px-3 border-b relative", className)}>
      <Select
        value={currentProject?.id}
        onValueChange={handleProjectChange}
        onOpenChange={(open) => setIsOpen(open)}
      >
        <SelectTrigger
          className="p-0 h-auto w-full border-0 bg-transparent shadow-none hover:bg-transparent focus:ring-0"
          aria-label="Selecionar projeto"
        >
          <SelectValue placeholder="Selecionar projeto">
            {currentProject && (
              <div className="flex w-full items-center gap-3">
                <Avatar className="h-10 w-10">
                  {currentProject.logo ? (
                    <AvatarImage
                      src={currentProject.logo}
                      alt={currentProject.name}
                    />
                  ) : (
                    <AvatarFallback
                      className={cn(
                        "text-white",
                        currentProject.color || "bg-gray-600"
                      )}
                    >
                      {currentProject.initials || currentProject.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium text-foreground">
                    {currentProject.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {truncateText(description, 20)}
                  </span>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>

        {/* Ícone à direita - posicionado absolutamente para não afetar o layout */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{
              duration: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>

        <SelectContent className="max-h-[300px] w-[250px]">
          {projects.map((project) => (
            <SelectItem
              key={project.id}
              value={project.id}
              className="p-2 focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex w-full items-center gap-3">
                <Avatar className="h-10 w-10">
                  {project.logo ? (
                    <AvatarImage src={project.logo} alt={project.name} />
                  ) : (
                    <AvatarFallback
                      className={cn(
                        "text-white",
                        project.color || "bg-gray-600"
                      )}
                    >
                      {project.initials || project.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {truncateText(project.description || "Workspace", 20)}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectedProject;
