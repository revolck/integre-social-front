"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/types/projects/projects-types";

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

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  hasSelectedProject: boolean;
  selectProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: sampleProjects,
      selectedProject: null,
      hasSelectedProject: false,
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
      name: "project-storage",
    }
  )
);
