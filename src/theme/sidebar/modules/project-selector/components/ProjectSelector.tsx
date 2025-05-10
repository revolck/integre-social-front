import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/custom/Icons";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectSelectorModal } from "./ProjectSelectorModal";
import { useProjectStore } from "../store/projectStore";

interface ProjectSelectorProps {
  isCollapsed?: boolean;
}

/**
 * Componente seletor de projetos para o sidebar
 *
 * Permite ao usuário visualizar o tenant atual e abrir o modal de seleção
 * Adapta-se a estados colapsados e não colapsados do sidebar
 */
export function ProjectSelector({ isCollapsed = false }: ProjectSelectorProps) {
  // Estado local para controle do modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado global dos projetos
  const { selectedProject, projects, hasSelectedProject } = useProjectStore();

  // Verificar necessidade de seleção inicial de projeto
  useEffect(() => {
    if (!hasSelectedProject && projects.length > 0) {
      setIsModalOpen(true);
    }
  }, [hasSelectedProject, projects.length]);

  // Handlers para o modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  /**
   * Trunca o nome do projeto se for muito longo
   */
  const truncateName = (name: string, maxLength = 20) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  return (
    <>
      <button
        onClick={openModal}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors`}
        aria-label="Selecionar tenant/projeto"
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

          {/* Nome do projeto - visível apenas quando não está colapsado */}
          {!isCollapsed && selectedProject && (
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                {truncateName(selectedProject.name)}
              </p>
            </div>
          )}
        </div>

        {/* Ícone de expansão - visível apenas quando não está colapsado */}
        {!isCollapsed && (
          <Icon
            name="ChevronDown"
            size={16}
            className="text-gray-500 dark:text-gray-400 flex-shrink-0"
          />
        )}
      </button>

      {/* Modal de seleção de projeto */}
      <ProjectSelectorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isInitialSelection={!hasSelectedProject}
      />
    </>
  );
}
