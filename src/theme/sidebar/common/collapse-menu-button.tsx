"use client";
import React from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/custom/Icons";
import * as LucideIcons from "lucide-react";
import { Submenu } from "@/lib/menus";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";

interface CollapseMenuButtonProps {
  icon: string;
  label: string;
  active: boolean;
  submenus: Submenu[];
  collapsed: boolean;
  hovered?: boolean;
  id: string;
}

export function CollapseMenuButton({
  icon,
  label,
  active,
  submenus,
  collapsed,
  hovered = false,
  id,
}: CollapseMenuButtonProps) {
  const pathname = usePathname();
  const isSubmenuActive = submenus.some(
    (submenu) => submenu.active || pathname.startsWith(submenu.href)
  );
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isSubmenuActive);
  const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();

  React.useEffect(() => {
    setIsCollapsed(isSubmenuActive);
  }, [isSubmenuActive, pathname]);

  // Regular collapsible menu for expanded sidebar
  if (!collapsed || hovered) {
    return (
      <Collapsible open={isCollapsed} onOpenChange={setIsCollapsed}>
        <CollapsibleTrigger asChild>
          <div className="peer flex items-center group [&[data-state=open]>button>div>div>svg]:rotate-180">
            <Button
              variant={active ? "default" : "ghost"}
              className="justify-start capitalize group h-auto py-3 px-3 w-full"
            >
              <div className="w-full items-center flex justify-between">
                <div className="flex items-center">
                  <span className="me-4">
                    <Icon
                      name={icon as keyof typeof LucideIcons}
                      className="h-5 w-5"
                    />
                  </span>
                  <p className="max-w-[150px] truncate">{label}</p>
                </div>
                <div className="whitespace-nowrap inline-flex items-center justify-center rounded-full h-5 w-5 bg-menu-arrow text-menu-menu-foreground group-hover:bg-menu-arrow-active transition-all duration-300">
                  <ChevronDown
                    size={16}
                    className="transition-transform duration-200"
                  />
                </div>
              </div>
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {submenus.map(({ href, label, active }, index) => (
            <Button
              key={index}
              onClick={() =>
                setMobileMenuConfig({ ...mobileMenuConfig, isOpen: false })
              }
              variant="ghost"
              className="w-full justify-start h-auto hover:bg-transparent capitalize text-sm font-normal mb-2 last:mb-0 first:mt-3 px-5"
              asChild
            >
              <Link href={href}>
                <span
                  className={cn(
                    "h-1.5 w-1.5 me-3 rounded-full transition-all duration-150 ring-1 ring-default-600",
                    {
                      "ring-4 bg-default ring-opacity-30 ring-default": active,
                    }
                  )}
                ></span>
                <p className="max-w-[170px] truncate">{label}</p>
              </Link>
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Dropdown menu for collapsed sidebar
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={active ? "default" : "ghost"}
                className="w-full justify-center"
                size="icon"
              >
                <Icon
                  name={icon as keyof typeof LucideIcons}
                  className="h-5 w-5"
                />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" align="start" alignOffset={2}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        side="right"
        sideOffset={20}
        align="start"
        className="border-sidebar space-y-1.5"
      >
        <DropdownMenuLabel className="max-w-[190px] truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-default-300" />
        <DropdownMenuGroup>
          {submenus.map(({ href, label, icon, active }, index) => (
            <DropdownMenuItem
              key={index}
              asChild
              className={cn("focus:bg-secondary", {
                "bg-secondary text-secondary-foreground": active,
              })}
            >
              <Link className="cursor-pointer flex gap-3" href={href}>
                {icon && (
                  <Icon
                    name={icon as keyof typeof LucideIcons}
                    className="h-4 w-4"
                  />
                )}
                <p className="max-w-[180px] truncate">{label}</p>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
