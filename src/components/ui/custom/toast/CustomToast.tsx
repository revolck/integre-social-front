"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react";
import { toastVariants } from "./variants";
import type { ToastOptions, CustomToasterProps } from "./types";

// Componente Toaster customizado
export function ToasterCustom({
  containerClassName,
  className,
  ...props
}: CustomToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system"}
      className={cn("toaster-custom", className)}
      toastOptions={{
        classNames: {
          toast: "group toast-custom-item",
          title: "text-base font-semibold",
          description:
            "text-sm opacity-90 group-[.toast-custom-item]:text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80",
          error: "group toast-custom-error",
          success: "group toast-custom-success",
          warning: "group toast-custom-warning",
          info: "group toast-custom-info",
        },
        ...props.toastOptions,
      }}
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
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

// Função factory para criar toasts
function createToast(
  options: ToastOptions | string,
  variant: "default" | "success" | "error" | "warning" | "info" = "default"
) {
  // Se for uma string, converte para opções
  if (typeof options === "string") {
    options = { description: options };
  }

  // Determina o ícone com base na variante
  let icon = options.icon;
  if (!icon) {
    switch (variant) {
      case "success":
        icon = <CheckCircle className="h-5 w-5 text-emerald-500" />;
        break;
      case "error":
        icon = <AlertCircle className="h-5 w-5 text-destructive" />;
        break;
      case "warning":
        icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
        break;
      case "info":
        icon = <Info className="h-5 w-5 text-blue-500" />;
        break;
    }
  }

  return sonnerToast(options.title || "", {
    description: options.description,
    action: options.action,
    icon,
    id: options.id,
    duration: options.duration || 5000,
    className: cn(toastVariants({ variant }), options.className),
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose
      ? (toastId) => options.onAutoClose && options.onAutoClose(String(toastId))
      : undefined,
    // Botão de fechar personalizado
    closeButton: true,
  });
}

// API pública para o toast
export const toastCustom = {
  // Métodos principais
  default: (options: ToastOptions | string) => createToast(options, "default"),
  success: (options: ToastOptions | string) => createToast(options, "success"),
  error: (options: ToastOptions | string) => createToast(options, "error"),
  warning: (options: ToastOptions | string) => createToast(options, "warning"),
  info: (options: ToastOptions | string) => createToast(options, "info"),

  // Método para dispensar um toast específico
  dismiss: (id?: string) => sonnerToast.dismiss(id),

  // Método para dispensar todos os toasts
  dismissAll: () => sonnerToast.dismiss(),

  // Método personalizado para promessas
  promise: <T extends unknown>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: ToastOptions | string;
      success: (data: T) => ToastOptions | string;
      error: (error: unknown) => ToastOptions | string;
    }
  ) => {
    // Convert string to options objects
    const loadingOptions =
      typeof loading === "string" ? { description: loading } : loading;

    // Generate a unique ID for this toast
    const id = loadingOptions.id || String(Date.now());

    // Show loading toast
    createToast({ ...loadingOptions, id }, "default");

    // Return a promise that updates the toast based on the result
    return promise
      .then((data) => {
        const successOptions = success(data);
        const successOpts =
          typeof successOptions === "string"
            ? { description: successOptions }
            : successOptions;

        createToast({ ...successOpts, id }, "success");
        return data;
      })
      .catch((err) => {
        const errorOptions = error(err);
        const errorOpts =
          typeof errorOptions === "string"
            ? { description: errorOptions }
            : errorOptions;

        createToast({ ...errorOpts, id }, "error");
        throw err;
      });
  },

  // Componente para o botão de fechar
  CloseButton: () => <X className="h-4 w-4 text-muted-foreground/80" />,
};
