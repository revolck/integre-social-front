"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "./use-mobile";

/**
 * Hook personalizado para gerenciar o estado de colapso da sidebar
 * Com persistência em localStorage e integração com tamanho da tela
 */
export function useSidebarCollapse() {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Carregar estado do localStorage ao montar o componente
  useEffect(() => {
    // Em dispositivos móveis, sidebar começa colapsada por padrão
    if (isMobile) {
      setCollapsed(true);
      return;
    }

    // Tenta recuperar a preferência do usuário do localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
  }, [isMobile]);

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    // Não salvar se for devido ao tamanho da tela (somente preferências do usuário)
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, isMobile]);

  // Função para alternar o estado
  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  return {
    collapsed,
    setCollapsed,
    toggleCollapse,
  };
}

export default useSidebarCollapse;
