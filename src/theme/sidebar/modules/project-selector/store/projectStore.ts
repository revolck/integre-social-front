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

  // Ações
  selectProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
}

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
    (set) => ({
      // Estado inicial
      projects: sampleProjects,
      selectedProject: null,
      hasSelectedProject: false,

      // Ações
      selectProject: (project) =>
        set({ selectedProject: project, hasSelectedProject: true }),

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
    }),
    {
      name: "tenant-storage", // Nome usado para armazenamento persistente
    }
  )
);
