"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ProjectAvatar } from "./projects-avatar";
import { ProjectSelectorModal } from "./projects-selector-modal";
import { useProjectStore } from "@/lib/projects/projects-store";

interface ProjectSelectorProps {
  isCollapsed?: boolean;
}

export function ProjectSelector({ isCollapsed = false }: ProjectSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedProject, projects, hasSelectedProject } = useProjectStore();

  // Check if this is the first time visiting the dashboard
  useEffect(() => {
    if (!hasSelectedProject && projects.length > 0) {
      setIsModalOpen(true);
    }
  }, [hasSelectedProject, projects.length]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const truncateName = (name: string) => {
    if (name.length <= 20) return name;
    return name.substring(0, 20) + "...";
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors`}
      >
        <div className="flex items-center gap-3">
          {selectedProject ? (
            <ProjectAvatar
              project={selectedProject}
              size={isCollapsed ? "md" : "sm"}
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                ?
              </span>
            </div>
          )}

          {!isCollapsed && selectedProject && (
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                {truncateName(selectedProject.name)}
              </p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        )}
      </button>

      <ProjectSelectorModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
