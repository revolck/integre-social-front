import { cva } from "class-variance-authority";

/**
 * Variantes para o container dos componentes de data
 */
export const datePickerContainerVariants = cva("relative w-full", {
  variants: {
    hasError: {
      true: "text-destructive",
      false: "",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
      false: "",
    },
  },
  defaultVariants: {
    hasError: false,
    disabled: false,
  },
});

/**
 * Variantes para o botão trigger dos componentes de data
 */
export const datePickerTriggerVariants = cva(
  "w-full justify-start text-left font-normal",
  {
    variants: {
      hasValue: {
        true: "",
        false: "text-muted-foreground",
      },
      hasError: {
        true: "border-destructive focus:border-destructive",
        false: "",
      },
    },
    defaultVariants: {
      hasValue: false,
      hasError: false,
    },
  }
);

/**
 * Variantes para o popover dos componentes de data
 */
export const datePickerPopoverVariants = cva("p-0", {
  variants: {
    size: {
      sm: "w-auto",
      md: "w-auto",
      lg: "w-auto",
      full: "w-full",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

/**
 * Variantes para os slots de tempo
 */
export const timeSlotVariants = cva("w-full", {
  variants: {
    selected: {
      true: "bg-primary text-primary-foreground",
      false: "",
    },
    available: {
      true: "",
      false: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    selected: false,
    available: true,
  },
});
