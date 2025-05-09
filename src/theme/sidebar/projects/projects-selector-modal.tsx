"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "./projects-avatar";
import { useProjectStore } from "@/lib/projects/projects-store";
import type { Project } from "@/types/projects/projects-types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSelectorModal({
  isOpen,
  onClose,
}: ProjectSelectorModalProps) {
  const { projects, selectedProject, selectProject } = useProjectStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    selectedProject?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project: Project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
  };

  const handleConfirm = () => {
    if (selectedProjectId) {
      const project = projects.find((p: Project) => p.id === selectedProjectId);
      if (project) {
        selectProject(project);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open || onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">Selecione seu projeto</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar projetos..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto pr-1 max-h-[50vh]">
          <div className="grid gap-2">
            {filteredProjects.map((project: Project) => (
              <div
                key={project.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer
                  ${
                    selectedProjectId === project.id
                      ? "bg-gray-100 dark:bg-[#1F1F23] border-2 border-gray-300 dark:border-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-[#1F1F23]/50 border border-gray-200 dark:border-gray-800"
                  }
                  transition-colors
                `}
                onClick={() => handleSelectProject(project)}
              >
                <ProjectAvatar project={project} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </p>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum projeto encontrado
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedProjectId}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
