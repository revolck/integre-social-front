"use client";

import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const projects = [
  {
    label: "Projetos Pessoais",
    projects: [
      {
        label: "Projeto Portfolio",
        value: "portfolio",
      },
    ],
  },
  {
    label: "Projetos da Empresa",
    projects: [
      {
        label: "Sistema Principal",
        value: "main-system",
      },
      {
        label: "Dashboard Analytics",
        value: "dashboard",
      },
    ],
  },
];

type Project = (typeof projects)[number]["projects"][number];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface ProjectSwitcherProps extends PopoverTriggerProps {
  collapsed: boolean;
  hovered: boolean;
}

export default function ProjectSwitcher({
  className,
  collapsed,
  hovered,
}: ProjectSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project>(
    projects[0].projects[0]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {collapsed && !hovered ? (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecione um projeto"
            className={cn("h-14 w-14 mx-auto p-0 border-secondary", className)}
          >
            <Avatar className="">
              <AvatarImage
                src="/images/project-icon.png"
                alt={selectedProject.label}
                className="grayscale"
              />
              <AvatarFallback>{selectedProject.label.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        ) : (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selecione um projeto"
            className={cn(
              "h-auto py-3 px-3 justify-start border-secondary w-full",
              className
            )}
          >
            <div className="flex gap-2 flex-1 items-center">
              <Avatar className="flex-none h-[38px] w-[38px]">
                <AvatarImage
                  src="/images/project-icon.png"
                  alt={selectedProject.label}
                  className="grayscale"
                />
                <AvatarFallback>
                  {selectedProject.label.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-start w-[100px]">
                <div className="text-sm font-semibold text-default-900">
                  Projetos
                </div>
                <div className="text-xs font-normal text-default-500 truncate">
                  {selectedProject.label}
                </div>
              </div>
              <div className="">
                <ChevronsUpDown className="ml-auto h-5 w-5 shrink-0 text-default-500" />
              </div>
            </div>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput
              placeholder="Buscar projeto..."
              className="placeholder:text-xs"
            />
            <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
            {projects.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.projects.map((project) => (
                  <CommandItem
                    key={project.value}
                    onSelect={() => {
                      setSelectedProject(project);
                      setOpen(false);
                    }}
                    className="text-sm font-normal"
                  >
                    {project.label}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedProject.value === project.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
