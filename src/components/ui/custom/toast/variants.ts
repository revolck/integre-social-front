import { cva } from "class-variance-authority";

// Definição de variantes para o toast
export const toastVariants = cva(
  "group relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        success:
          "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300",
        error: "border-destructive/30 bg-destructive/10 text-destructive",
        warning:
          "border-amber-500/30 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300",
        info: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
