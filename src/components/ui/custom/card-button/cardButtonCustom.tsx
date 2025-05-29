"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/custom/Icons";
import { cardButtonVariants, cardButtonIconVariants } from "./variants";
import type { CardButtonCustomProps, CardButtonGroupProps } from "./types";

/**
 * Componente CardButtonCustom - Um botão card com ícone e label
 */
const CardButtonCustom = React.forwardRef<
  HTMLButtonElement,
  CardButtonCustomProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      fullWidth = false,
      icon,
      label,
      iconSize = 20,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          cardButtonVariants({
            variant,
            size,
            fullWidth,
          }),
          className
        )}
        disabled={disabled}
        {...props}
      >
        <div
          className={cn(
            cardButtonIconVariants({
              variant,
              size,
            })
          )}
        >
          <Icon name={icon} size={iconSize} />
        </div>

        <span className="text-sm font-medium text-center">{label}</span>
      </button>
    );
  }
);

CardButtonCustom.displayName = "CardButtonCustom";

/**
 * Componente CardButtonGroup - Grupo de botões card organizados em grid
 */
const CardButtonGroup = React.forwardRef<HTMLDivElement, CardButtonGroupProps>(
  (
    {
      buttons,
      variant = "default",
      size = "default",
      className,
      buttonClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4",
          className
        )}
        {...props}
      >
        {buttons.map((button, index) => (
          <CardButtonCustom
            key={index}
            icon={button.icon}
            label={button.label}
            onClick={button.onClick}
            disabled={button.disabled}
            variant={variant}
            size={size}
            className={buttonClassName}
          />
        ))}
      </div>
    );
  }
);

CardButtonGroup.displayName = "CardButtonGroup";

export { CardButtonCustom, CardButtonGroup };
