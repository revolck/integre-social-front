import { VariantProps } from "class-variance-authority";
import { toastVariants } from "./variants";

// Interface para as opções de toast
export interface ToastOptions extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  duration?: number;
  id?: string;
  className?: string;
  onDismiss?: () => void;
  onAutoClose?: (id: string) => void;
}

// Interface para o componente ToasterProps
export interface CustomToasterProps {
  containerClassName?: string;
  className?: string;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  expand?: boolean;
  offset?: string | number;
  theme?: "light" | "dark" | "system";
  richColors?: boolean;
  closeButton?: boolean;
  toastOptions?: Partial<{
    classNames?: Partial<Record<string, string>>;
    descriptionClassName?: string;
    actionButtonClassName?: string;
    cancelButtonClassName?: string;
    duration?: number;
  }>;
}
