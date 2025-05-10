import React from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/custom/Icons";
import { SidebarHeaderProps } from "../../types/sidebar.types";

/**
 * Componente de cabeçalho para o sidebar
 *
 * Responsável apenas por renderizar o cabeçalho com o logo e o botão de fechar
 * Segue o princípio de responsabilidade única (SRP)
 */
export function SidebarHeader({
  isCollapsed,
  onCloseMobile,
}: SidebarHeaderProps) {
  return (
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

        {!isCollapsed && (
          <span className="font-semibold text-gray-900 dark:text-white ml-1">
            IntegreApp
          </span>
        )}
      </div>

      {/* Botão de fechar para mobile - visível apenas em telas pequenas */}
      <button
        onClick={onCloseMobile}
        className="md:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
        aria-label="Fechar menu"
      >
        <Icon name="X" size={20} />
      </button>
    </div>
  );
}
