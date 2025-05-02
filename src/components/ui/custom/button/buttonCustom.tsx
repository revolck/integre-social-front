"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon, IconName } from "@/components/ui/custom/Icons";
import { Loader2 } from "lucide-react";

// Definindo as variantes do botão
const buttonCustomVariants = cva(
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

// Props do componente
export interface ButtonCustomProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonCustomVariants> {
  asChild?: boolean;
  icon?: IconName;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  loadingText?: string;
  withAnimation?: boolean;
}

// Componente ButtonCustom
const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonCustomProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      withAnimation = true,
      icon,
      iconPosition = "left",
      isLoading = false,
      loadingText,
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determina o componente a ser renderizado
    const Comp = asChild ? Slot : "button";

    // Conteúdo interno do botão
    const buttonContent = (
      <>
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {loadingText || children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && <Icon name={icon} />}
            {children}
            {icon && iconPosition === "right" && <Icon name={icon} />}
          </>
        )}
      </>
    );

    // Se withAnimation for true, aplica animação no próprio botão
    if (withAnimation) {
      const MotionComp = motion(Comp as any);
      return (
        <MotionComp
          data-slot="button-custom"
          className={cn(
            buttonCustomVariants({
              variant,
              size,
              fullWidth,
              withAnimation,
              className,
            })
          )}
          ref={ref}
          disabled={isLoading || props.disabled}
          whileTap={{ scale: 0.93 }}
          transition={{ duration: 0.1 }}
          {...props}
        >
          <span className="flex items-center justify-center gap-2 w-full">
            {buttonContent}
          </span>
        </MotionComp>
      );
    }

    // Versão sem animação
    return (
      <Comp
        data-slot="button-custom"
        className={cn(
          buttonCustomVariants({
            variant,
            size,
            fullWidth,
            withAnimation,
            className,
          })
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  }
);

ButtonCustom.displayName = "ButtonCustom";

export { ButtonCustom, buttonCustomVariants };
