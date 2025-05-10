import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "./ProjectAvatar";
import { useProjectStore } from "../store/projectStore";
import type { Project } from "../types/project.types";
import { Icon } from "@/components/ui/custom/Icons";
import { Input } from "@/components/ui/input";
import { X as CloseIcon } from "lucide-react";

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
    <>
      {/* Overlay manual personalizado que cobre toda a tela */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999]"
          aria-hidden="true"
          style={{
            pointerEvents: isInitialSelection ? "none" : "auto",
          }}
          onClick={isInitialSelection ? undefined : onClose}
        />
      )}

      {/* Modal personalizado que não depende do Dialog.Overlay padrão */}
      <div
        className={`fixed inset-0 z-[10000] flex items-center justify-center ${
          isOpen ? "block" : "hidden"
        }`}
        style={{ pointerEvents: "none" }}
      >
        <div
          className="bg-background rounded-lg border shadow-lg w-full max-w-lg overflow-hidden"
          style={{ pointerEvents: "auto" }}
        >
          {/* Cabeçalho com título e botão fechar (apenas quando não é inicial) */}
          <div className="flex justify-between items-start p-6 pb-0">
            <div>
              <h2 className="text-xl font-semibold">
                {isInitialSelection
                  ? "Selecione seu ambiente de trabalho"
                  : "Selecione seu projeto"}
              </h2>

              {isInitialSelection && (
                <p className="text-sm text-muted-foreground mt-2">
                  Para continuar, selecione em qual tenant/projeto você deseja
                  trabalhar. Cada projeto acessa uma base de dados separada.
                </p>
              )}
            </div>

            {/* Botão de fechar - presente APENAS quando não é seleção inicial */}
            {!isInitialSelection && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <CloseIcon className="h-5 w-5" />
                <span className="sr-only">Fechar</span>
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Campo de busca */}
            <div className="relative mb-4">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              />
              <Input
                placeholder="Buscar projetos..."
                className="pl-9"
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
                          ? "bg-gray-100 dark:bg-[#1F1F23] border-2 border-blue-400 dark:border-blue-500"
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
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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

            {/* Rodapé com botões */}
            <div className="flex justify-end gap-2 mt-6">
              {/* Mostrar botão cancelar apenas se não for a seleção inicial obrigatória */}
              {!isInitialSelection && (
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              )}

              <Button
                onClick={handleConfirm}
                disabled={!selectedProjectId}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
