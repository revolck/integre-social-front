"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/partials/logo/logoTheme";
import SidebarHoverToggle from "../sidebar-hover-toggle";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import ProjectSwitcher from "../common/project-switcher";
import { useMenuHoverConfig } from "@/hooks/use-menu-hover";
import { Icon } from "@/components/ui/custom/Icons";

interface MenuDragAbleProps {
  collapsed: boolean;
}

export function MenuDragAble({ collapsed }: MenuDragAbleProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname, (key: string) => key);
  const [hoverConfig] = useMenuHoverConfig();
  const { hovered } = hoverConfig;

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4">
        <Logo className="tx__royal-blue" />
        <SidebarHoverToggle collapsed={collapsed} onToggle={() => {}} />
      </div>

      <ScrollArea className="[&>div>div[style]]:!block">
        <div
          className={cn("space-y-3 mt-6", {
            "px-4": !collapsed || hovered,
            "text-center": collapsed && !hovered,
          })}
        >
          <ProjectSwitcher collapsed={collapsed} hovered={hovered} />
        </div>

        <nav className="h-full w-full">
          <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-4">
            {menuList?.map(({ groupLabel, menus }, index) => (
              <li
                className={cn("w-full", groupLabel ? "pt-5" : "")}
                key={index}
              >
                {(!collapsed || hovered) && groupLabel ? (
                  <MenuLabel label={groupLabel} />
                ) : collapsed && !hovered && groupLabel ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger className="w-full">
                        <div className="w-full flex justify-center items-center">
                          <Icon name="Ellipsis" className="h-5 w-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{groupLabel}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <p className="pb-2"> </p>
                )}
                {menus.map(
                  ({ href, label, icon, active, id, submenus }, index) =>
                    submenus.length === 0 ? (
                      <div className="w-full" key={index}>
                        <TooltipProvider disableHoverableContent>
                          <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <div>
                                <MenuItem
                                  label={label}
                                  icon={icon}
                                  href={href}
                                  active={active}
                                  id={id}
                                  collapsed={collapsed}
                                  hovered={hovered}
                                />
                              </div>
                            </TooltipTrigger>
                            {collapsed && !hovered && (
                              <TooltipContent side="right">
                                {label}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <div className="w-full" key={index}>
                        <CollapseMenuButton
                          icon={icon}
                          label={label}
                          active={active}
                          submenus={submenus}
                          collapsed={collapsed}
                          hovered={hovered}
                          id={id}
                        />
                      </div>
                    )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </>
  );
}
