import { VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";
import { IconName } from "../Icons";
import { cardButtonVariants } from "./variants";

/**
 * Props para o componente CardButtonCustom
 */
export interface CardButtonCustomProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof cardButtonVariants> {
  /**
   * Ícone a ser exibido no botão
   */
  icon: IconName;

  /**
   * Texto do label do botão
   */
  label: string;

  /**
   * Tamanho do ícone
   * @default 20
   */
  iconSize?: number;

  /**
   * Se o botão está desabilitado
   * @default false
   */
  disabled?: boolean;
}

/**
 * Props para o componente CardButtonGroup
 */
export interface CardButtonGroupProps {
  /**
   * Lista de botões para renderizar
   */
  buttons: Array<{
    icon: IconName;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }>;

  /**
   * Variante aplicada a todos os botões
   * @default "default"
   */
  variant?: VariantProps<typeof cardButtonVariants>["variant"];

  /**
   * Tamanho aplicado a todos os botões
   * @default "default"
   */
  size?: VariantProps<typeof cardButtonVariants>["size"];

  /**
   * Classes CSS adicionais para o container
   */
  className?: string;

  /**
   * Classes CSS adicionais para cada botão
   */
  buttonClassName?: string;
}
