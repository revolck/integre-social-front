import { Project } from "@/theme/sidebar/selected-project";

/**
 * Serviço para gerenciar projetos
 * Este serviço segue o padrão Singleton para garantir uma única instância em toda a aplicação
 */
class ProjectService {
  private static instance: ProjectService;
  private currentProject: Project | null = null;
  private projectListeners: ((project: Project) => void)[] = [];

  // Singleton pattern
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * Obtém todos os projetos disponíveis para o usuário
   * Em um cenário real, isso buscaria do backend via API
   */
  public async getProjects(): Promise<Project[]> {
    // Simulação de chamada de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "1",
            name: "Codeshaper",
            logo: "/api/placeholder/40/40",
            initials: "CS",
            color: "bg-blue-600",
          },
          {
            id: "2",
            name: "Instituto Amadal",
            logo: "/api/placeholder/40/40",
            initials: "IA",
            color: "bg-green-600",
          },
          {
            id: "3",
            name: "DashCode",
            logo: "/api/placeholder/40/40",
            initials: "DC",
            color: "bg-purple-600",
          },
        ]);
      }, 300);
    });
  }

  /**
   * Define o projeto atual e notifica todos os ouvintes
   */
  public setCurrentProject(project: Project): void {
    this.currentProject = project;

    // Salvar no localStorage para persistência
    if (typeof window !== "undefined") {
      localStorage.setItem("currentProject", JSON.stringify(project));
    }

    // Notificar ouvintes
    this.projectListeners.forEach((listener) => listener(project));
  }

  /**
   * Obtém o projeto atual
   * Se não houver projeto atual, tenta recuperar do localStorage
   */
  public getCurrentProject(): Project | null {
    if (!this.currentProject && typeof window !== "undefined") {
      const savedProject = localStorage.getItem("currentProject");
      if (savedProject) {
        try {
          this.currentProject = JSON.parse(savedProject);
        } catch (error) {
          console.error("Error parsing saved project:", error);
        }
      }
    }
    return this.currentProject;
  }

  /**
   * Adiciona um ouvinte para ser notificado quando o projeto mudar
   */
  public addProjectChangeListener(
    listener: (project: Project) => void
  ): () => void {
    this.projectListeners.push(listener);

    // Retorna função para remover o ouvinte
    return () => {
      this.projectListeners = this.projectListeners.filter(
        (l) => l !== listener
      );
    };
  }
}

export default ProjectService;
