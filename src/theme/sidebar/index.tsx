"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconName } from "@/components/ui/custom/Icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { SelectedProject } from "./selected-project";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SidebarSection } from "./SidebarSection";
import { SidebarSubMenu } from "./SidebarSubMenu";

// Tipos para os itens de navegação
interface NavItemBase {
  title: string;
  icon?: IconName;
}

interface NavItemLink extends NavItemBase {
  type: "link";
  href: string;
}

interface NavItemSubmenu extends NavItemBase {
  type: "submenu";
  items: Array<{
    title: string;
    href: string;
  }>;
}

type NavItem = NavItemLink | NavItemSubmenu;

// Tipos para as seções de navegação
interface NavSection {
  title?: string;
  items: NavItem[];
}

// Props para o componente Sidebar
interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const DashboardSidebar = ({
  className,
  collapsed = false,
  onCollapse,
}: SidebarProps) => {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Navegação do sidebar - itens e seções
  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        {
          type: "link",
          title: "Dashboard",
          icon: "LayoutDashboard",
          href: "/dashboard",
        },
        {
          type: "submenu",
          title: "Analytics",
          icon: "BarChart2",
          items: [
            { title: "Overview", href: "/analytics" },
            { title: "Reports", href: "/analytics/reports" },
            { title: "Metrics", href: "/analytics/metrics" },
          ],
        },
        {
          type: "submenu",
          title: "E-commerce",
          icon: "ShoppingCart",
          items: [
            { title: "Products", href: "/ecommerce/products" },
            { title: "Orders", href: "/ecommerce/orders" },
            { title: "Customers", href: "/ecommerce/customers" },
          ],
        },
      ],
    },
    {
      title: "Apps",
      items: [
        {
          type: "link",
          title: "Chat",
          icon: "MessageSquare",
          href: "/apps/chat",
        },
        {
          type: "link",
          title: "Email",
          icon: "Mail",
          href: "/apps/email",
        },
        {
          type: "link",
          title: "Kanban",
          icon: "Trello",
          href: "/apps/kanban",
        },
        {
          type: "link",
          title: "Calendar",
          icon: "Calendar",
          href: "/apps/calendar",
        },
        {
          type: "link",
          title: "Todo",
          icon: "CheckSquare",
          href: "/apps/todo",
        },
      ],
    },
    {
      title: "Pages",
      items: [
        {
          type: "submenu",
          title: "Authentication",
          icon: "Lock",
          items: [
            { title: "Login", href: "/auth/login" },
            { title: "Register", href: "/auth/register" },
            { title: "Forgot Password", href: "/auth/forgot-password" },
          ],
        },
        {
          type: "submenu",
          title: "Utility",
          icon: "Settings",
          items: [
            { title: "Settings", href: "/utility/settings" },
            { title: "Profile", href: "/utility/profile" },
            { title: "Help Center", href: "/utility/help" },
          ],
        },
      ],
    },
  ];

  // Verificar se um item está ativo
  const isActive = (href: string) => pathname === href;

  // Verificar se um submenu tem algum item ativo
  const hasActiveSubItem = (items: Array<{ href: string }>) => {
    return items.some((item) => isActive(item.href));
  };

  // Adaptação do layout para dispositivos móveis
  const sidebarWidth = collapsed || isMobile ? "w-16" : "w-64";

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300",
        sidebarWidth,
        className
      )}
    >
      {/* Seletor de Projeto - agora utilizando o hook useProjects internamente */}
      {!collapsed && <SelectedProject />}

      {/* Navegação Principal */}
      <div className="flex flex-1 flex-col overflow-y-auto px-2 py-4">
        {navSections.map((section, sectionIndex) => (
          <SidebarSection
            key={`section-${sectionIndex}`}
            title={!collapsed ? section.title : undefined}
          >
            {section.items.map((item, itemIndex) => {
              // Link simples
              if (item.type === "link") {
                return (
                  <SidebarMenuItem
                    key={`item-${sectionIndex}-${itemIndex}`}
                    href={item.href}
                    icon={item.icon}
                    title={!collapsed ? item.title : ""}
                    active={isActive(item.href)}
                  />
                );
              }

              // Submenu - ocultado quando collapsed
              if (item.type === "submenu" && !collapsed) {
                return (
                  <SidebarSubMenu
                    key={`submenu-${sectionIndex}-${itemIndex}`}
                    icon={item.icon}
                    title={item.title}
                    items={item.items.map((subItem) => ({
                      ...subItem,
                      active: isActive(subItem.href),
                    }))}
                    defaultOpen={hasActiveSubItem(item.items)}
                  />
                );
              }

              // Versão simplificada do submenu quando collapsed
              if (item.type === "submenu" && collapsed) {
                return (
                  <SidebarMenuItem
                    key={`item-collapsed-${sectionIndex}-${itemIndex}`}
                    href={item.items[0].href} // Link para o primeiro item
                    icon={item.icon}
                    title=""
                    active={hasActiveSubItem(item.items)}
                  />
                );
              }

              return null;
            })}
          </SidebarSection>
        ))}
      </div>

      {/* Rodapé do Sidebar */}
      <div className="border-t p-4">
        <SidebarMenuItem
          href="/help-support"
          icon="HelpCircle"
          title={!collapsed ? "Help & Support" : ""}
        />
      </div>
    </div>
  );
};

export default DashboardSidebar;
