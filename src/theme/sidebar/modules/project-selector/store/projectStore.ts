"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  projects: Project[];
  selectedProject: Project | null;
  hasSelectedProject: boolean;
  lastSelectionDate: string | null;
  isFirstTimeUser: boolean;
  isLoading: boolean;

  // Ações
  selectProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  setIsLoading: (loading: boolean) => void;

  // Getters
  shouldShowProjectSelector: () => boolean;
  checkAndUpdateSelectionDate: () => void;
  resetFirstTimeUser: () => void;
}

// Helper para obter a data atual no formato YYYY-MM-DD
const getCurrentDate = () => {
  return new Date().toISOString().split("T")[0];
};

/**
 * Store de projetos/tenants utilizando Zustand com persistência
 *
 * Gerencia o estado global relacionado a tenants do sistema:
 * - Lista de tenants disponíveis para o usuário
 * - Tenant selecionado atualmente (determina qual fonte de dados é usada)
 * - Ações para manipulação de tenants
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

      // Ações
      selectProject: (project) =>
        set({
          selectedProject: project,
          hasSelectedProject: true,
          lastSelectionDate: getCurrentDate(),
          isLoading: true,
        }),

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

        // Se não tiver data de seleção ou for diferente de hoje
        if (!state.lastSelectionDate || state.lastSelectionDate !== today) {
          // Se tiver apenas um projeto, seleciona automaticamente
          if (state.projects.length === 1) {
            get().selectProject(state.projects[0]);
          }
        }
      },

      resetFirstTimeUser: () => set({ isFirstTimeUser: false }),
    }),
    {
      name: "tenant-storage", // Nome usado para armazenamento persistente
      partialize: (state) => ({
        // Não persistimos o estado de loading
        selectedProject: state.selectedProject,
        hasSelectedProject: state.hasSelectedProject,
        lastSelectionDate: state.lastSelectionDate,
        isFirstTimeUser: state.isFirstTimeUser,
      }),
    }
  )
);
