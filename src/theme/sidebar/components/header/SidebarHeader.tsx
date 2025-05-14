// src/theme/sidebar/components/header/SidebarHeader.tsx
import React from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
import { SidebarHeaderProps } from "../../types/sidebar.types";
import { toastCustom } from "@/components/ui/custom/toast"; // Importar toastCustom

/**
 * Componente de cabeçalho para o sidebar
 */
export function SidebarHeader({
  isCollapsed,
  onCloseMobile,
}: SidebarHeaderProps) {
  // Handler para mostrar informações sobre o app
  const handleLogoClick = () => {
    toastCustom.info({
      title: "IntegreApp",
      description: "Sistema de gestão integrada v1.0.2",
      icon: (
        <div className="rounded-full bg-blue-100 p-1.5">
          <Icon name="Info" size={16} className="text-blue-500" />
        </div>
      ),
      duration: 5000,
    });
  };

  // Handler para fechar com confirmação em mobile
  const handleMobileClose = () => {
    toastCustom.withUndo(
      "Menu lateral fechado", 
      () => {
        // Simula a reabertura do menu
        setTimeout(() => {
          // Reabrir menu lateralmente
          onCloseMobile();
          
          // Confirma a operação
          toastCustom.success({
            description: "Menu reaberto com sucesso",
            duration: 2000,
          });
        }, 300);
      }
    );
    
    // Fecha o menu
    onCloseMobile();
  };

  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-[#1F1F23]">
      <div className="flex items-center gap-3">
        <div onClick={handleLogoClick} className="cursor-pointer">
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

        {!isCollapsed && (
          <span className="font-semibold text-gray-900 dark:text-white ml-1">
            IntegreApp
          </span>
        )}
      </div>

      {/* Botão de fechar para mobile - visível apenas em telas pequenas */}
      <button
        onClick={handleMobileClose}
        className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
        aria-label="Fechar menu"
      >
        <Icon name="X" size={20} />
      </button>
    </div>
  );
}