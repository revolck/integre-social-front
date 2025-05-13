"use client";

import { useState, useEffect } from "react";
import { Search, Info, Loader2 } from "lucide-react";
import { ProjectAvatar } from "./ProjectAvatar";
import { useProjectStore } from "../store/projectStore";
import { toastCustom } from "@/components/ui/custom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ModalCustom,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalContentWrapper,
} from "@/components/ui/custom";

import type { Project } from "../types/project.types";

interface ProjectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Indica se é a seleção inicial obrigatória (sem opção de cancelar)
   * Na primeira vez que o usuário acessa o sistema
   */
  isInitialSelection?: boolean;
}

/**
 * Modal aprimorado para seleção de projetos/tenants
 *
 * Características:
 * - Design responsivo para mobile e desktop
 * - Animações suaves
 * - Estados de pesquisa, carregamento e seleção
 * - Lógica para primeira utilização
 */
export function ProjectSelectorModal({
  isOpen,
  onClose,
  isInitialSelection = false,
}: ProjectSelectorModalProps) {
  // Verificação de tamanho de tela
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Acesso ao estado global dos projetos
  const { projects, selectedProject, selectProject, setIsLoading } =
    useProjectStore();

  // Estados locais
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    selectedProject?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [isConfirming, setIsConfirming] = useState(false);

  // Sincroniza o selectedProjectId quando o selectedProject muda
  useEffect(() => {
    if (selectedProject) {
      setSelectedProjectId(selectedProject.id);
    }
  }, [selectedProject]);

  // Filtra os projetos com base na query de busca
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

  /**
   * Atualiza o projeto selecionado localmente
   */
  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
  };

  /**
   * Confirma a seleção e atualiza o estado global
   */
  const handleConfirm = async () => {
    if (!selectedProjectId) {
      toastCustom.error({
        title: "Seleção necessária",
        description: "Selecione um projeto para continuar.",
      });
      return;
    }

    // Atualizar estado para mostrar loading
    setIsConfirming(true);

    try {
      const project = projects.find((p: Project) => p.id === selectedProjectId);
      if (project) {
        // Seleciona o projeto no store
        selectProject(project);

        // Simula uma chamada API para carregar dados do projeto
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Finaliza o loading
        setIsLoading(false);

        // Fecha o modal
        onClose();

        // Notificação de sucesso
        toastCustom.success({
          title: "Projeto selecionado",
          description: `Você está agora trabalhando em: ${project.name}`,
        });
      }
    } catch (error) {
      toastCustom.error({
        title: "Erro ao selecionar projeto",
        description: "Ocorreu um erro ao carregar os dados do projeto.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  // Variantes de animação para os itens da lista
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={
        isInitialSelection ? undefined : (open) => !open && onClose()
      }
      size={isMobile ? "full" : "md"}
      isDismissable={!isInitialSelection}
      isKeyboardDismissDisabled={isInitialSelection}
      backdrop="blur"
      hideCloseButton={isInitialSelection}
    >
      <ModalContentWrapper
        placement={isMobile ? "bottom" : "center"}
        isDismissable={!isInitialSelection}
        isKeyboardDismissDisabled={isInitialSelection}
        hideCloseButton={isInitialSelection}
        motionProps={{
          initial: {
            opacity: 0,
            y: isMobile ? 100 : 0,
            scale: isMobile ? 1 : 0.95,
          },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: {
            opacity: 0,
            y: isMobile ? 100 : 0,
            scale: isMobile ? 1 : 0.95,
          },
          transition: { duration: 0.2 },
        }}
      >
        <ModalHeader>
          <ModalTitle>
            {isInitialSelection
              ? "Bem-vindo! Selecione um projeto"
              : "Escolha um projeto"}
          </ModalTitle>
          {isInitialSelection && (
            <ModalDescription>
              Selecione o projeto em que deseja trabalhar. Esta seleção
              determina quais dados e funcionalidades estarão disponíveis.
            </ModalDescription>
          )}
        </ModalHeader>

        <ModalBody className="py-2">
          {/* Campo de busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Pesquise por um projeto..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lista de projetos filtrados */}
          <div
            className={cn(
              "relative overflow-y-auto pr-1",
              isMobile ? "max-h-[40vh]" : "max-h-[50vh]"
            )}
          >
            <AnimatePresence mode="wait">
              {filteredProjects.length > 0 ? (
                <motion.div
                  key="project-list"
                  className="grid gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {filteredProjects.map((project: Project, index: number) => (
                    <motion.div
                      key={project.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer border",
                        selectedProjectId === project.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                        "transition-all duration-200 ease-in-out"
                      )}
                      onClick={() => handleSelectProject(project)}
                    >
                      <ProjectAvatar
                        project={project}
                        size="md"
                        isSelected={selectedProjectId === project.id}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Criado em:{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400"
                >
                  <Info className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-center">
                    Nenhum projeto encontrado com este termo
                  </p>
                  <p className="text-xs mt-1">
                    Tente outro termo ou limpe a busca
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ModalBody>

        <ModalFooter>
          {/* Botão cancelar não aparece na seleção inicial */}
          {!isInitialSelection && (
            <Button variant="outline" onClick={onClose} disabled={isConfirming}>
              Cancelar
            </Button>
          )}

          <Button
            onClick={handleConfirm}
            disabled={!selectedProjectId || isConfirming}
            className={cn(
              "relative",
              isInitialSelection
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : ""
            )}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}
