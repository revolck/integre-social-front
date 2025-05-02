"use client";

import { useState, useEffect } from "react";
import ProjectService from "@/services/projects/projectService";
import { Project } from "@/theme/sidebar/selected-project";

/**
 * Hook personalizado para gerenciar projetos na aplicação
 */
export function useProjects() {
  const projectService = ProjectService.getInstance();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(
    projectService.getCurrentProject()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega projetos ao montar o componente
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);

        // Se não houver projeto atual, definir o primeiro como atual
        if (!currentProject && projectsData.length > 0) {
          projectService.setCurrentProject(projectsData[0]);
          setCurrentProject(projectsData[0]);
        }

        setError(null);
      } catch (err) {
        setError("Falha ao carregar projetos");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Escuta por alterações no projeto atual
  useEffect(() => {
    const unsubscribe = projectService.addProjectChangeListener((project) => {
      setCurrentProject(project);
    });

    return unsubscribe;
  }, []);

  // Função para mudar o projeto atual
  const changeProject = (project: Project) => {
    projectService.setCurrentProject(project);
  };

  return {
    projects,
    currentProject,
    loading,
    error,
    changeProject,
  };
}

export default useProjects;
