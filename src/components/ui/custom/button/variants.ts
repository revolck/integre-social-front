import { cva } from "class-variance-authority";

/**
 * Variantes do componente ButtonCustom usando CVA
 */
export const buttonCustomVariants = cva(
  "inline-flex items-center justify-center gap-2 hover:opacity-90 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg__royal-blue text-white",
        primary: "bg__teal--d30 text-white",
        secondary: "bg__black--d30 text-white",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        danger: "bg__pink-light--d30 text-white",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        md: "h-10 px-5 py-2",
        lg: "h-12 rounded-md px-6 has-[>svg]:px-4 text-base",
        xl: "h-14 rounded-md px-8 has-[>svg]:px-6 text-base",
        icon: "size-9",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      withAnimation: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      withAnimation: true,
    },
  }
);
