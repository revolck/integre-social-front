import Image from "next/image";
import type { Project } from "@/types/projects/projects-types";

interface ProjectAvatarProps {
  project: Project;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProjectAvatar({
  project,
  size = "md",
  className = "",
}: ProjectAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <>
      {project.logoUrl ? (
        <div
          className={`relative ${sizeClasses[size]} rounded-md overflow-hidden ${className}`}
        >
          <Image
            src={project.logoUrl || "/placeholder.svg"}
            alt={project.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        >
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {getInitials(project.name)}
          </span>
        </div>
      )}
    </>
  );
}
