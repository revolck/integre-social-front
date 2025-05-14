"use client";

import React, { forwardRef } from "react";
import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { DEFAULT_TOAST_CONFIG } from "./toastConfig";
import {
  toastVariants,
  toastActionVariants,
  toastLinkVariants,
} from "./variants";
import type {
  ToastOptions,
  CustomToasterProps,
  ToastPromiseOptions,
  ToastActionButtonProps,
  ToastLinkProps,
} from "./types";

/**
 * Componente ToastActionButton
 * Botão estilizado para ações em toasts
 */
export const ToastActionButton = forwardRef<
  HTMLButtonElement,
  ToastActionButtonProps
>(
  (
    {
      children,
      onClick,
      className,
      variant = "default",
      size = "sm",
      disabled,
      isLoading,
      icon,
      ariaLabel,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-label={
          ariaLabel || (typeof children === "string" ? children : undefined)
        }
        className={cn(
          toastActionVariants({ variant, size }),
          isLoading && "opacity-70 cursor-wait",
          className
        )}
      >
        {isLoading && (
          <span className="mr-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          </span>
        )}
        {icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </button>
    );
  }
);

ToastActionButton.displayName = "ToastActionButton";

/**
 * Componente ToastLink
 * Link estilizado para ações em toasts
 */
export const ToastLink = forwardRef<HTMLAnchorElement, ToastLinkProps>(
  (
    { children, href, onClick, className, variant = "default", external, icon },
    ref
  ) => {
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <a
        ref={ref}
        href={href}
        onClick={onClick}
        className={cn(toastLinkVariants({ variant }), className)}
        {...externalProps}
      >
        {children}
        {icon && <span className="ml-1">{icon}</span>}
      </a>
    );
  }
);

ToastLink.displayName = "ToastLink";

/**
 * Componente ToasterCustom
 * Contêiner de toasts personalizado com tema e estilos
 */
export function ToasterCustom(props: CustomToasterProps) {
  const { theme = "system" } = useTheme();

  // Mesclar as configurações padrão com as props fornecidas
  const mergedProps = {
    ...DEFAULT_TOAST_CONFIG,
    ...props,
    toastOptions: {
      ...DEFAULT_TOAST_CONFIG.toastOptions,
      ...(props.toastOptions || {}),
      classNames: {
        ...(DEFAULT_TOAST_CONFIG.toastOptions?.classNames || {}),
        ...(props.toastOptions?.classNames || {}),
      },
    },
  };

  return (
    <SonnerToaster
      theme={mergedProps.theme as "light" | "dark" | "system"}
      className={cn("toaster-custom", mergedProps.className)}
      position={mergedProps.position}
      expand={mergedProps.expand}
      richColors={mergedProps.richColors}
      closeButton={mergedProps.closeButton}
      offset={mergedProps.offset}
      gap={
        typeof mergedProps.gap === "string"
          ? parseInt(mergedProps.gap)
          : mergedProps.gap
      }
      duration={mergedProps.defaultDuration}
      visibleToasts={mergedProps.maxToasts}
      toastOptions={mergedProps.toastOptions}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "hsl(var(--success) / 0.1)",
          "--success-text": "hsl(var(--success))",
          "--success-border": "hsl(var(--success) / 0.2)",
          "--error-bg": "hsl(var(--destructive) / 0.1)",
          "--error-text": "hsl(var(--destructive))",
          "--error-border": "hsl(var(--destructive) / 0.2)",
          "--warning-bg": "hsl(var(--warning) / 0.1)",
          "--warning-text": "hsl(var(--warning))",
          "--warning-border": "hsl(var(--warning) / 0.2)",
          "--info-bg": "hsl(var(--info) / 0.1)",
          "--info-text": "hsl(var(--info))",
          "--info-border": "hsl(var(--info) / 0.2)",
        } as React.CSSProperties
      }
    />
  );
}

/**
 * Função factory para criar toasts com configurações personalizadas
 */
function createToast(
  options: ToastOptions | string,
  variant:
    | "default"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "action"
    | "confirmation"
    | "status" = "default"
) {
  // Se for uma string, converte para opções
  if (typeof options === "string") {
    options = { description: options };
  }

  const {
    title,
    description,
    action,
    icon: customIcon,
    duration = 5000,
    id = String(Date.now()),
    className,
    onDismiss,
    onAutoClose,
    disableSwipe = false,
    cancelText,
    onCancel,
    linkText,
    linkHref,
    onLinkClick,
    linkVariant = "default",
    density = "normal",
    prominence = "low",
  } = options;

  // Determina o ícone com base na variante
  let icon = customIcon;
  if (!icon) {
    // Escolha do ícone baseado na variante e no contexto mostrado na imagem
    switch (variant) {
      case "success":
        icon = (
          <Icon name="CheckCircle" size={20} className="text-emerald-500" />
        );
        break;
      case "error":
        icon = (
          <Icon name="AlertCircle" size={20} className="text-destructive" />
        );
        break;
      case "warning":
        icon = (
          <Icon name="AlertTriangle" size={20} className="text-amber-500" />
        );
        break;
      case "info":
        icon = <Icon name="Info" size={20} className="text-blue-500" />;
        break;
      case "confirmation":
        icon = <Icon name="Trash2" size={20} className="text-indigo-500" />;
        break;
      case "action":
        icon = <Icon name="CreditCard" size={20} className="text-purple-500" />;
        break;
      case "status":
        icon = <Icon name="Archive" size={20} className="text-gray-500" />;
        break;
    }
  }

  // Cria o link se especificado
  const link =
    linkText && (linkHref || onLinkClick) ? (
      <ToastLink
        href={linkHref}
        onClick={onLinkClick}
        variant={linkVariant}
        icon={<Icon name="MoveRight" size={14} />}
      >
        {linkText}
      </ToastLink>
    ) : null;

  // Cria o botão de cancelamento se especificado
  const cancelAction =
    cancelText && onCancel ? (
      <ToastActionButton
        variant="outline"
        size="sm"
        onClick={onCancel}
        className="ml-2"
      >
        {cancelText}
      </ToastActionButton>
    ) : null;

  // Configuração de ações combinadas
  const combinedAction =
    action || cancelAction || link ? (
      <div className="flex items-center gap-2 mt-2">
        {action}
        {cancelAction}
        {link && <div className="ml-auto">{link}</div>}
      </div>
    ) : undefined;

  // Ajusta duração baseada na proeminência
  const adjustedDuration =
    prominence === "high" ? Math.max(duration, 8000) : duration;

  // Cria o toast usando o Sonner
  return sonnerToast(title || "", {
    description,
    action: combinedAction,
    icon,
    id,
    duration: adjustedDuration,
    className: cn(
      toastVariants({
        variant,
        density,
        prominence,
      }),
      className
    ),
    onDismiss,
    onAutoClose: onAutoClose
      ? (toastId) => onAutoClose && onAutoClose(String(toastId))
      : undefined,
    closeButton: true,
    // Opções de interatividade
    dismissible: !disableSwipe,
  });
}

/**
 * API pública para o toast
 */
export const toastCustom = {
  // Métodos principais por variante
  default: (options: ToastOptions | string) => createToast(options, "default"),
  success: (options: ToastOptions | string) => createToast(options, "success"),
  error: (options: ToastOptions | string) => createToast(options, "error"),
  warning: (options: ToastOptions | string) => createToast(options, "warning"),
  info: (options: ToastOptions | string) => createToast(options, "info"),

  // Novos métodos baseados nos exemplos de imagem
  action: (options: ToastOptions | string) => createToast(options, "action"),
  confirmation: (options: ToastOptions | string) =>
    createToast(options, "confirmation"),
  status: (options: ToastOptions | string) => createToast(options, "status"),

  // Métodos para gerenciar toasts
  dismiss: (id?: string) => sonnerToast.dismiss(id),
  dismissAll: () => sonnerToast.dismiss(),

  // Método personalizado para promessas
  promise: <T extends unknown>(
    promise: Promise<T>,
    options: ToastPromiseOptions<T>
  ) => {
    // Convert string to options objects
    const loadingOptions =
      typeof options.loading === "string"
        ? { description: options.loading }
        : options.loading;

    // Generate a unique ID for this toast
    const id = loadingOptions.id || String(Date.now());

    // Show loading toast with infinite duration
    createToast(
      {
        ...loadingOptions,
        id,
        duration: Infinity, // Loading state should persist until promise resolves
      },
      "default"
    );

    // Return a promise that updates the toast based on the result
    return promise
      .then((data) => {
        const successOptions = options.success(data);
        const successOpts =
          typeof successOptions === "string"
            ? { description: successOptions }
            : successOptions;

        createToast({ ...successOpts, id }, "success");
        return data;
      })
      .catch((err) => {
        const errorOptions = options.error(err);
        const errorOpts =
          typeof errorOptions === "string"
            ? { description: errorOptions }
            : errorOptions;

        createToast({ ...errorOpts, id }, "error");
        throw err;
      });
  },

  // Método especializado para toasts de créditos (baseado na imagem)
  credits: (options: ToastOptions | string) => {
    const opts =
      typeof options === "string"
        ? { title: "Credits purchased successfully!", description: options }
        : { title: "Credits purchased successfully!", ...options };

    return createToast(
      {
        ...opts,
        icon: <Icon name="CreditCard" size={20} className="text-emerald-500" />,
        prominence: "high",
      },
      "success"
    );
  },

  // Método especializado para toasts de imagem gerada (baseado na imagem)
  imageGenerated: (timeInSecs: number, options?: Partial<ToastOptions>) => {
    return createToast(
      {
        title: `Image generated in ${timeInSecs} secs!`,
        description: "Your design is finished and waiting in the queue.",
        icon: <Icon name="Image" size={20} className="text-blue-500" />,
        prominence: "low",
        ...options,
      },
      "info"
    );
  },

  // Método especializado para confirmação de exclusão (baseado na imagem)
  confirmDelete: (
    entityName: string,
    onDelete: () => void,
    onCancel: () => void,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        title: "Delete conversation?",
        description: `Deleting ${entityName} will permanently remove the chat memory and it's associated data.`,
        cancelText: "Cancel",
        onCancel,
        action: (
          <ToastActionButton variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </ToastActionButton>
        ),
        duration: 10000, // Longer duration for confirmations
        prominence: "high",
        disableSwipe: true,
        ...options,
      },
      "confirmation"
    );
  },

  // Método especializado para toasts com ações de desfazer (baseado na imagem)
  withUndo: (
    message: string,
    onUndo: () => void,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        description: message,
        action: (
          <ToastActionButton variant="outline" size="sm" onClick={onUndo}>
            Undo
          </ToastActionButton>
        ),
        ...options,
      },
      "status"
    );
  },

  // Método especializado para toasts com link (baseado na imagem)
  withLink: (
    message: string,
    linkText: string,
    linkHref: string,
    options?: Partial<ToastOptions>
  ) => {
    return createToast(
      {
        description: message,
        linkText,
        linkHref,
        ...options,
      },
      "info"
    );
  },

  // Componentes exportados para uso personalizado
  ActionButton: ToastActionButton,
  Link: ToastLink,

  // Componente para o botão de fechar
  CloseButton: () => (
    <Icon name="X" size={16} className="text-muted-foreground/80" />
  ),
};
