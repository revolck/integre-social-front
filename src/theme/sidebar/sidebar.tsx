"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp, X, ChevronRight } from "lucide-react";
import {
  BarChart2,
  Home,
  Receipt,
  Building2,
  CreditCard,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  ShoppingBag,
  FileText,
  Calendar,
  Mail,
} from "lucide-react";

import { ProjectSelector } from "./project/project-selector";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  active?: boolean;
  submenu?: MenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isCollapsed,
}: SidebarProps) {
  const menuSections: MenuSection[] = [
    {
      title: "DASHBOARD",
      items: [
        { icon: Home, label: "Dashboard", href: "#", active: true },
        { icon: BarChart2, label: "Analytics", href: "#" },
      ],
    },
    {
      title: "APLICAÇÕES",
      items: [
        { icon: MessagesSquare, label: "Chat", href: "#" },
        { icon: Mail, label: "Email", href: "#" },
        { icon: Calendar, label: "Calendário", href: "#" },
        { icon: FileText, label: "Tarefas", href: "#" },
        {
          icon: ShoppingBag,
          label: "E-commerce",
          submenu: [
            {
              icon: Users2,
              label: "Usuários",
              submenu: [
                { icon: null, label: "Perfis", href: "#" },
                { icon: null, label: "Configurações", href: "#" },
              ],
            },
            {
              icon: Building2,
              label: "Produtos",
              submenu: [
                { icon: null, label: "Listagem", href: "#" },
                { icon: null, label: "Detalhes", href: "#" },
                { icon: null, label: "Categorias", href: "#" },
              ],
            },
            { icon: CreditCard, label: "Pagamentos", href: "#" },
            { icon: Receipt, label: "Pedidos", href: "#" },
          ],
        },
      ],
    },
    {
      title: "FINANCEIRO",
      items: [
        { icon: Wallet, label: "Transações", href: "#" },
        { icon: Receipt, label: "Faturas", href: "#" },
        { icon: CreditCard, label: "Pagamentos", href: "#" },
      ],
    },
    {
      title: "EQUIPE",
      items: [
        { icon: Users2, label: "Membros", href: "#" },
        { icon: Shield, label: "Permissões", href: "#" },
        { icon: Video, label: "Reuniões", href: "#" },
      ],
    },
  ];

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <nav
        className={`
          fixed inset-y-0 left-0 z-[70] bg-white dark:bg-[#0F0F12] transform transition-all duration-200 ease-in-out
          lg:translate-x-0 lg:static border-r border-gray-200 dark:border-[#1F1F23] overflow-hidden
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-16" : "w-64"}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#1F1F23]">
            <div className="flex items-center gap-3">
              <Image
                src="https://kokonutui.com/logo.svg"
                alt="Logo"
                width={32}
                height={32}
                className="flex-shrink-0 hidden dark:block"
              />
              <Image
                src="https://kokonutui.com/logo-black.svg"
                alt="Logo"
                width={32}
                height={32}
                className="flex-shrink-0 block dark:hidden"
              />
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-gray-200 dark:border-[#1F1F23]">
            <ProjectSelector isCollapsed={isCollapsed} />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="space-y-6">
              {menuSections.map((section) => (
                <div
                  key={section.title}
                  className={cn("px-3", isCollapsed && "px-1")}
                >
                  {!isCollapsed && (
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {section.title}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <MenuItem
                        key={item.label}
                        item={item}
                        isCollapsed={isCollapsed}
                        handleNavigation={handleNavigation}
                        level={0}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

interface MenuItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  handleNavigation: () => void;
  level: number;
}

function MenuItem({
  item,
  isCollapsed,
  handleNavigation,
  level,
}: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const Icon = item.icon;
  const submenuRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle clicks outside submenu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        submenuRef.current &&
        !submenuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Ensure submenu and tooltip close when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed && isOpen) {
      setIsOpen(false);
    }
  }, [isCollapsed, isOpen]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed && level === 0) {
      // Delay showing tooltip to prevent flicker
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  // For collapsed state with submenu
  if (isCollapsed && level === 0) {
    const menuContent = (
      <button
        onClick={hasSubmenu ? toggleSubmenu : handleNavigation}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative w-10 h-10 mx-auto my-1 flex items-center justify-center rounded-md transition-colors",
          item.active || isOpen
            ? "bg-primary/90 text-primary-foreground dark:bg-primary/90 dark:text-primary-foreground"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1F1F23]"
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
      </button>
    );

    return (
      <div className="relative">
        {item.href && !hasSubmenu ? (
          <Link href={item.href} onClick={handleNavigation} className="block">
            {menuContent}
          </Link>
        ) : (
          <div>{menuContent}</div>
        )}

        {/* Submenu popup for collapsed state */}
        {hasSubmenu && (showTooltip || isOpen) && (
          <div
            ref={submenuRef}
            className={cn(
              "absolute left-full top-0 ml-2 w-48 rounded-md bg-white dark:bg-[#202024] shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50",
              "transform transition-opacity duration-200",
              isOpen
                ? "opacity-100"
                : showTooltip
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            style={{ marginTop: isOpen ? "0" : "-10px" }}
          >
            {/* Header - shows with active item color if menu is open */}
            <div
              className={cn(
                "flex items-center p-2 rounded-t-md",
                isOpen
                  ? "bg-indigo-500 text-white font-medium"
                  : "border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
              )}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              <p className="text-sm">{item.label}</p>
            </div>

            {/* Submenu items */}
            <div className="py-1">
              {item.submenu?.map((subItem) => (
                <div key={subItem.label} className="px-2 py-0.5">
                  {subItem.href ? (
                    <Link
                      href={subItem.href}
                      onClick={handleNavigation}
                      className="flex items-center px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300"
                    >
                      {subItem.icon && (
                        <subItem.icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>{subItem.label}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubmenu(e);
                      }}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-[#2A2A30] text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center">
                        {subItem.icon && (
                          <subItem.icon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                        )}
                        <span>{subItem.label}</span>
                      </div>
                      {subItem.submenu && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard menu item (non-collapsed or submenu)
  return (
    <div className="relative">
      {item.href && !hasSubmenu ? (
        <Link
          href={item.href}
          onClick={handleNavigation}
          className={cn(
            "flex items-center px-3 py-2 text-sm rounded-md transition-colors w-full",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F23]",
            item.active
              ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white font-medium"
              : "text-gray-600 dark:text-gray-300",
            level > 0 && "text-xs"
          )}
        >
          {Icon && <Icon className="h-4 w-4 mr-3 flex-shrink-0" />}
          <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
        </Link>
      ) : (
        <button
          onClick={toggleSubmenu}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-md transition-colors",
            "hover:bg-gray-100 dark:hover:bg-[#1F1F23]",
            isOpen
              ? "bg-gray-100 dark:bg-[#1F1F23] text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-300",
            level > 0 && "text-xs"
          )}
        >
          <div className="flex items-center">
            {Icon && <Icon className="h-4 w-4 mr-3 flex-shrink-0" />}
            <span className={level > 0 ? "ml-1" : ""}>{item.label}</span>
          </div>
          {hasSubmenu && (
            <div className="flex items-center">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </button>
      )}

      {hasSubmenu && isOpen && (
        <div
          ref={submenuRef}
          className={cn(
            "mt-1 pl-4 border-l border-gray-200 dark:border-gray-700",
            "overflow-hidden"
          )}
        >
          {item.submenu?.map((subItem) => (
            <MenuItem
              key={subItem.label}
              item={subItem}
              isCollapsed={isCollapsed}
              handleNavigation={handleNavigation}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
