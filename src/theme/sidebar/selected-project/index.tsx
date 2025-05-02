"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Tipos para os projetos
export interface Project {
  id: string;
  name: string;
  logo?: string;
  initials?: string;
  color?: string;
}

interface SelectedProjectProps {
  projects: Project[];
  currentProject?: Project;
  onProjectChange?: (project: Project) => void;
  className?: string;
}

export const SelectedProject = ({
  projects,
  currentProject,
  onProjectChange,
  className,
}: SelectedProjectProps) => {
  // Estado para controlar o projeto selecionado
  const [selected, setSelected] = useState<Project | undefined>(
    currentProject || projects[0]
  );

  // Função para lidar com a mudança de projeto
  const handleProjectChange = (value: string) => {
    const newProject = projects.find((p) => p.id === value);
    if (newProject) {
      setSelected(newProject);
      if (onProjectChange) {
        onProjectChange(newProject);
      }
    }
  };

  return (
    <div className={cn("px-2 py-3", className)}>
      <Select value={selected?.id} onValueChange={handleProjectChange}>
        <SelectTrigger
          className="h-auto w-full border-none bg-background px-2 py-2 shadow-none hover:bg-accent [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-3"
          aria-label="Selecionar projeto"
        >
          <SelectValue placeholder="Selecionar projeto">
            {selected && (
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  {selected.logo ? (
                    <img
                      src={selected.logo}
                      alt={selected.name}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-medium text-foreground",
                        selected.color
                      )}
                    >
                      {selected.initials || selected.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {selected.name}
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
