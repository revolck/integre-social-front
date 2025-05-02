"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";

// Tipos para os projetos são importados direto do hook
export interface Project {
  id: string;
  name: string;
  logo?: string;
  initials?: string;
  color?: string;
}

interface SelectedProjectProps {
  className?: string;
}

export const SelectedProject = ({ className }: SelectedProjectProps) => {
  // Usando o hook customizado para gerenciar projetos
  const { projects, currentProject, loading, changeProject } = useProjects();

  // Função para lidar com a mudança de projeto
  const handleProjectChange = (value: string) => {
    const newProject = projects.find((p) => p.id === value);
    if (newProject) {
      changeProject(newProject);
    }
  };

  // Se estiver carregando, exibir um skeleton
  if (loading) {
    return (
      <div className={cn("px-2 py-3", className)}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8">
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  // Se não houver projetos, exibir mensagem
  if (projects.length === 0) {
    return (
      <div className={cn("px-2 py-3", className)}>
        <div className="text-sm text-muted-foreground">
          Nenhum projeto encontrado
        </div>
      </div>
    );
  }

  return (
    <div className={cn("px-2 py-3", className)}>
      <Select value={currentProject?.id} onValueChange={handleProjectChange}>
        <SelectTrigger
          className="h-auto w-full border-none bg-background px-2 py-2 shadow-none hover:bg-accent [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-3"
          aria-label="Selecionar projeto"
        >
          <SelectValue placeholder="Selecionar projeto">
            {currentProject && (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentProject.logo ? (
                    <img
                      src={currentProject.logo}
                      alt={currentProject.name}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium text-foreground",
                        currentProject.color
                      )}
                    >
                      {currentProject.initials || currentProject.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {currentProject.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Workspace
                    </span>
                  </div>
                </div>
                <Icon
                  name="ChevronDown"
                  size={16}
                  className="ml-auto text-muted-foreground"
                />
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px] w-[250px]">
          {projects.map((project) => (
            <SelectItem
              key={project.id}
              value={project.id}
              className="p-0 focus:bg-accent focus:text-accent-foreground"
            >
              <div className="flex w-full items-center gap-3 px-2 py-2">
                {project.logo ? (
                  <img
                    src={project.logo}
                    alt={project.name}
                    className="h-8 w-8 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium text-foreground",
                      project.color
                    )}
                  >
                    {project.initials || project.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Workspace
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
