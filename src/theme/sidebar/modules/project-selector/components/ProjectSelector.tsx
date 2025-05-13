"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ProjectAvatar } from "./ProjectAvatar";
import { useProjectStore } from "../store/projectStore";
import { ProjectSelectorModal } from "./ProjectSelectorModal";
import { motion, AnimatePresence } from "framer-motion";
import { toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
  isCollapsed?: boolean;
}

/**
 * Componente seletor de projetos para o sidebar
 *
 * Características:
 * - Adaptativo ao estado colapsado/expandido da sidebar
 * - Animações suaves para transições
 * - Gerencia estados de loading e primeira utilização
 */
export function ProjectSelector({ isCollapsed = false }: ProjectSelectorProps) {
  // Estado local para controle do modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado global dos projetos
  const {
    selectedProject,
    projects,
    shouldShowProjectSelector,
    checkAndUpdateSelectionDate,
    resetFirstTimeUser,
    isFirstTimeUser,
    isLoading,
  } = useProjectStore();

  // Verificar necessidade de seleção inicial e atualizar data
  useEffect(() => {
    // Verificar se precisa atualizar a data de seleção
    checkAndUpdateSelectionDate();

    // Verificar se deve mostrar o seletor de projetos na inicialização
    if (shouldShowProjectSelector()) {
      setIsModalOpen(true);
    }
  }, [checkAndUpdateSelectionDate, shouldShowProjectSelector]);

  // Handlers para o modal
  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    // Se for primeira utilização e não tiver projeto selecionado, não permite fechar
    if (isFirstTimeUser && !selectedProject) {
      toastCustom.error({
        title: "Seleção necessária",
        description: "Você precisa selecionar um projeto para continuar.",
      });
      return;
    }

    // Não é mais primeira utilização
    if (isFirstTimeUser) {
      resetFirstTimeUser();
    }

    setIsModalOpen(false);
  };

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
        className={cn(
          "w-full flex items-center p-2 rounded-lg transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-between",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        )}
        aria-label="Selecionar projeto"
      >
        <motion.div className="flex items-center gap-3" layout>
          {selectedProject ? (
            <ProjectAvatar
              project={selectedProject}
              size={isCollapsed ? "md" : "sm"}
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                ?
              </span>
            </div>
          )}

          {/* Nome do projeto - com animação para transição */}
          <AnimatePresence mode="wait">
            {!isCollapsed && selectedProject && (
              <motion.div
                key="project-name"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-left overflow-hidden"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                  {truncateName(selectedProject.name)}
                </p>
                {isLoading && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Carregando dados...
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Ícone de expansão - visível apenas quando não está colapsado */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                size={16}
                className="text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-200"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Modal de seleção de projeto */}
      <ProjectSelectorModal
        isOpen={isModalOpen}
        onClose={closeModal}
        isInitialSelection={isFirstTimeUser}
      />
    </>
  );
}
