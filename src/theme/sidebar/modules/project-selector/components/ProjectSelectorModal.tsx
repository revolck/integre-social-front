import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ButtonCustom } from "@/components/ui/custom/button";
import { ProjectAvatar } from "./ProjectAvatar";
import { useProjectStore } from "../store/projectStore";
import type { Project } from "../types/project.types";
import { Icon } from "@/components/ui/custom/Icons";
import { Input } from "@/components/ui/input";

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
 * Modal para seleção de projetos/tenants
 *
 * Permite ao usuário selecionar qual tenant/contexto usar para acessar os dados
 * Esta é uma escolha crítica que determina qual fonte de dados será utilizada
 */
export function ProjectSelectorModal({
  isOpen,
  onClose,
  isInitialSelection = false,
}: ProjectSelectorModalProps) {
  // Acesso ao estado global dos projetos
  const { projects, selectedProject, selectProject } = useProjectStore();

  // Estados locais
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    selectedProject?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);

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
    <Dialog
      open={isOpen}
      // Se for seleção inicial, impedir fechamento por Escape ou clique fora
      onOpenChange={
        isInitialSelection ? undefined : (open) => !open && onClose()
      }
      modal={true}
    >
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-hidden z-[10000]"
        // Também desabilitar fechamento pelo botão X se for seleção inicial
        onEscapeKeyDown={
          isInitialSelection ? (e) => e.preventDefault() : undefined
        }
        onPointerDownOutside={
          isInitialSelection ? (e) => e.preventDefault() : undefined
        }
        onInteractOutside={
          isInitialSelection ? (e) => e.preventDefault() : undefined
        }
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            Escolha um projeto social
          </DialogTitle>

          {isInitialSelection && (
            <p className="text-sm text-muted-foreground mt-2">
              Para continuar, escolha em qual projeto social você quer
              trabalhar.
            </p>
          )}
        </DialogHeader>

        {/* Campo de busca */}
        <div className="relative mb-4">
          <Icon
            name="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
          />
          <Input
            placeholder="Pesquise por um projeto social..."
            className="pl-9 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lista de projetos filtrados */}
        <div className="overflow-y-auto pr-1 max-h-[50vh]">
          <div className="grid gap-2">
            {filteredProjects.map((project: Project) => (
              <div
                key={project.id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer
                  ${
                    selectedProjectId === project.id
                      ? "bg-gray-100 dark:bg-[#1F1F23] border-1 border-[#00d091] dark:border-blue-500"
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

                {/* Ícone de check para o projeto selecionado */}
                {selectedProjectId === project.id && (
                  <div className="flex-shrink-0 w-6 h-6 bg-[#007533] rounded-full flex items-center justify-center">
                    <Icon name="Check" className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Mensagem quando nenhum projeto é encontrado */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Nenhum projeto encontrado
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {/* Mostrar botão cancelar apenas se não for a seleção inicial obrigatória */}
          {!isInitialSelection && (
            <ButtonCustom variant="outline" onClick={onClose}>
              Cancelar
            </ButtonCustom>
          )}

          <ButtonCustom
            onClick={handleConfirm}
            disabled={!selectedProjectId}
            variant="default"
            size="lg"
            fullWidth
            withAnimation={true}
            className={
              isInitialSelection ? "bg-blue-500 hover:bg-blue-600" : ""
            }
          >
            Confirmar
          </ButtonCustom>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
