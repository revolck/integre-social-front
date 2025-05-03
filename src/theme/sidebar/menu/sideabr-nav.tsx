"use client";
import React from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Group } from "@/lib/menus";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import MenuLabel from "../common/menu-label";
import { Icon } from "@/components/ui/custom/Icons";
import * as LucideIcons from "lucide-react";
import { CollapseMenuButton2 } from "../common/collapse-menu-button2";
import ProjectSwitcher from "../common/project-switcher";

interface SidebarNavProps {
  menuList: Group[];
  hasSubMenu?: boolean;
  subMenu?: boolean;
}

const SidebarNav = ({
  menuList,
  hasSubMenu = false,
  subMenu = false,
}: SidebarNavProps) => {
  const pathname = usePathname();
  const activeKey = pathname?.split("/")?.[2];
  const data = menuList.find((item) => item.id === activeKey);

  // Render null if subMenu is true or hasSubMenu is false
  if (subMenu || !hasSubMenu) {
    return null;
  }

  return (
    <div className="h-full bg-sidebar shadow-base w-[228px] relative z-20">
      <ScrollArea className="[&>div>div[style]]:!block h-full">
        <div className="px-4 space-y-3 mt-6">
          <ProjectSwitcher collapsed={false} hovered={true} />
        </div>
        <div className="px-4 pt-6 sticky top-0 bg-sidebar z-20">
          {data?.groupLabel && (
            <MenuLabel
              label={data.groupLabel}
              className="text-xl py-0 font-semibold capitalize text-default"
            />
          )}
        </div>
        <nav className="mt-6 h-full w-full">
          <ul className="h-full space-y-1.5 flex flex-col items-start px-4 pb-8">
            {data?.menus.map(({ submenus }, index) =>
              submenus?.map(
                ({ href, label, active, icon, children: subChildren }, i) => (
                  <li key={`double-menu-index-${i}`} className="w-full">
                    {subChildren?.length === 0 ? (
                      <Button
                        asChild
                        variant={active ? "default" : "ghost"}
                        className="h-10 capitalize justify-start md:px-3 px-3 w-full"
                      >
                        <Link href={href}>
                          {icon && (
                            <Icon
                              name={icon as keyof typeof LucideIcons}
                              className="h-5 w-5 me-2"
                            />
                          )}
                          <p>{label}</p>
                        </Link>
                      </Button>
                    ) : (
                      subChildren && (
                        <CollapseMenuButton2
                          icon={icon}
                          label={label}
                          active={active}
                          submenus={subChildren}
                        />
                      )
                    )}
                  </li>
                )
              )
            )}
          </ul>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default SidebarNav;
