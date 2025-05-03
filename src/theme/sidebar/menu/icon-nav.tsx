"use client";
import React from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import Logo from "@/components/partials/logo/logoTheme";
import { Group } from "@/lib/menus";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/custom/Icons";
import * as LucideIcons from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconNavProps {
  menuList: Group[];
  collapsed: boolean;
}

const IconNav = ({ menuList, collapsed }: IconNavProps) => {
  if (!collapsed) return null;

  return (
    <div className="h-full bg-sidebar border-r border-default-200 dark:border-secondary border-dashed w-[72px]">
      <div className="text-center py-5">
        <Logo className="text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background mx-auto" />
      </div>
      <ScrollArea className="[&>div>div[style]]:!block h-full">
        <nav className="mt-8 h-full w-full">
          <ul className="h-full flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-2">
            {menuList?.map(({ groupLabel, menus }, index) => (
              <li key={index} className="block w-full">
                {menus?.map(
                  ({ href, label, icon, active, id, submenus }, menuIndex) => (
                    <TooltipProvider disableHoverableContent key={menuIndex}>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            size="icon"
                            variant={active ? "default" : "ghost"}
                            className={cn(
                              "h-12 w-12 mx-auto mb-2 hover:ring-1 hover:ring-offset-0 hover:ring-default-200 dark:hover:ring-menu-arrow-active  hover:bg-default-100 dark:hover:bg-secondary",
                              {
                                "bg-default-100 dark:bg-secondary  hover:bg-default-200/80 dark:hover:bg-menu-arrow-active ring-1 ring-default-200 dark:ring-menu-arrow-active":
                                  active,
                              }
                            )}
                          >
                            <Link href={href}>
                              <Icon
                                name={icon as keyof typeof LucideIcons}
                                className="w-6 h-6 text-default-500 dark:text-secondary-foreground"
                              />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">{label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default IconNav;
