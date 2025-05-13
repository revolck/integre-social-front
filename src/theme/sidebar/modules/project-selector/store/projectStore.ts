// src/theme/sidebar/modules/project-selector/store/projectStore.ts
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toastCustom } from "@/components/ui/custom";
import type { Project } from "../types/project.types";

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Instituto Amadal",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Instituto Amigos da Sopa Maceió",
    logoUrl: "https://kokonutui.com/logo.svg",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Tech Solutions",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Global Marketing Agency",
    logoUrl: "https://kokonutui.com/logo-black.svg",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Healthcare Innovations",
    createdAt: new Date(),
  },
];

/**
 * Interface de estado para o store de projetos/tenants
 */
interface ProjectState {
  // Estados
  projects: Project[];
  selectedProject: Project | null;
  hasSelectedProject: boolean;
  lastSelectionDate: string | null;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  isSelectorModalOpen: boolean;
  isConfirmingSelection: boolean;
  temporarySelectedProject: Project | null;

  // Ações
  selectProject: (project: Project) => void;
  setTemporarySelectedProject: (project: Project | null) => void;
  confirmProjectSelection: () => Promise<void>;
  openProjectSelector: () => void;
  closeProjectSelector: () => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  resetFirstTimeUser: () => void;

  // Getters
  shouldShowProjectSelector: () => boolean;
  checkAndUpdateSelectionDate: () => void;
}

// Helper para obter a data atual no formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Store de projetos/tenants utilizando Zustand com persistência
 */
export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      projects: sampleProjects,
      selectedProject: null,
      hasSelectedProject: false,
      lastSelectionDate: null,
      isFirstTimeUser: true,
      isLoading: false,
      isSelectorModalOpen: false,
      isConfirmingSelection: false,
      temporarySelectedProject: null,

      // Seleção temporária de projeto (para a modal)
      setTemporarySelectedProject: (project) =>
        set({ temporarySelectedProject: project }),

      // Ações
      selectProject: (project) =>
        set({
          selectedProject: project,
          hasSelectedProject: true,
          lastSelectionDate: getCurrentDate(),
          isLoading: true,
        }),

      // Confirmação de seleção - processo completo
      confirmProjectSelection: async () => {
        const state = get();
        const project = state.temporarySelectedProject;

        if (!project) return;

        // Inicia processo de confirmação
        set({ isConfirmingSelection: true });

        try {
          // Seleciona o projeto no estado
          get().selectProject(project);

          // Simula carregamento de dados
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Fecha o modal ANTES de mostrar o toast
          set({
            isSelectorModalOpen: false,
            isConfirmingSelection: false,
          });

          // Aguarda um pouco para garantir que o modal fechou
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Mostra o toast de sucesso
          toastCustom.success({
            title: "Projeto selecionado",
            description: `Você está agora trabalhando em: ${project.name}`,
          });

          // Finaliza o carregamento
          set({ isLoading: false });
        } catch (error) {
          // Em caso de erro
          toastCustom.error({
            title: "Erro ao selecionar projeto",
            description: "Ocorreu um erro ao carregar os dados do projeto.",
          });

          set({
            isLoading: false,
            isConfirmingSelection: false,
          });
        }
      },

      // Abrir o seletor de projetos
      openProjectSelector: () => {
        const state = get();
        set({
          isSelectorModalOpen: true,
          temporarySelectedProject: state.selectedProject,
        });
      },

      // Fechar o seletor de projetos
      closeProjectSelector: () => {
        const state = get();

        // Se estiver no processo de confirmação, não permitir fechar
        if (state.isConfirmingSelection) return;

        set({
          isSelectorModalOpen: false,
          temporarySelectedProject: null,
        });
      },

      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),

      updateProject: (project) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? project : p
          ),
          selectedProject:
            state.selectedProject?.id === project.id
              ? project
              : state.selectedProject,
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          selectedProject:
            state.selectedProject?.id === id ? null : state.selectedProject,
          hasSelectedProject:
            state.selectedProject?.id === id ? false : state.hasSelectedProject,
        })),

      setIsLoading: (loading) => set({ isLoading: loading }),

      resetFirstTimeUser: () => set({ isFirstTimeUser: false }),

      // Getters e métodos utilitários
      shouldShowProjectSelector: () => {
        const state = get();

        // Se for a primeira vez do usuário ou não houver projeto selecionado
        if (state.isFirstTimeUser || !state.hasSelectedProject) {
          return true;
        }

        // Se só tiver um projeto, não mostra o seletor
        if (state.projects.length === 1) {
          return false;
        }

        // Se a data da última seleção for diferente de hoje, mostra o seletor
        const today = getCurrentDate();
        return state.lastSelectionDate !== today;
      },

      checkAndUpdateSelectionDate: () => {
        const state = get();
        const today = getCurrentDate();

        // Verificar se precisa mostrar seletor hoje
        if (state.shouldShowProjectSelector()) {
          set({ isSelectorModalOpen: true });
        }

        // Se tem só um projeto, seleciona automaticamente
        if (state.projects.length === 1 && !state.selectedProject) {
          get().selectProject(state.projects[0]);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "tenant-storage", // Nome usado para armazenamento persistente
      partialize: (state) => ({
        // Não persistimos estados temporários
        selectedProject: state.selectedProject,
        hasSelectedProject: state.hasSelectedProject,
        lastSelectionDate: state.lastSelectionDate,
        isFirstTimeUser: state.isFirstTimeUser,
      }),
    }
  )
);
