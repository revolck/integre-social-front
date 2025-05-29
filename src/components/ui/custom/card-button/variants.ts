import { cva } from "class-variance-authority";

/**
 * Variantes do componente CardButtonCustom usando CVA
 */
export const cardButtonVariants = cva(
  "h-auto flex flex-col items-center rounded-sm justify-center gap-2 transition-all duration-200 group disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--global-terciary)] bg-[var(--global-secondary)] hover:bg-[var(--global-secondary-hover)]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary hover:bg-secondary/80",
      },
      size: {
        sm: "py-3 px-3",
        default: "py-4 px-4",
        lg: "py-5 px-5",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

/**
 * Variantes para o ícone do CardButton
 */
export const cardButtonIconVariants = cva(
  "p-3 rounded-full transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--global-terciary)] text-[var(--global-title)] group-hover:bg-[var(--global-terciary-hover)] group-hover:text-white",
        outline:
          "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground",
        ghost:
          "bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground",
        secondary:
          "bg-primary text-primary-foreground group-hover:bg-primary/90",
      },
      size: {
        sm: "p-2",
        default: "p-3",
        lg: "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
