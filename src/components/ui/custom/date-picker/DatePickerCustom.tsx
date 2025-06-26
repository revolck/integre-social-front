"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  datePickerContainerVariants,
  datePickerTriggerVariants,
  datePickerPopoverVariants,
} from "./variants";
import type { DatePickerCustomProps } from "./types";

export const DatePickerCustom = React.forwardRef<
  HTMLButtonElement,
  DatePickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione uma data",
      disabled = false,
      required = false,
      className,
      dateFormat = "dd/MM/yyyy",
      locale = ptBR,
      value,
      onChange,
      calendarProps,
      buttonProps,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (date: Date | undefined) => {
      onChange?.(date);
      setOpen(false);
    };

    const containerClasses = cn(
      datePickerContainerVariants({
        hasError: !!error,
        disabled,
      }),
      className
    );

    const triggerClasses = cn(
      datePickerTriggerVariants({
        hasValue: !!value,
        hasError: !!error,
      })
    );

    return (
      <div className={containerClasses}>
        {label && (
          <Label className="mb-2 block">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              className={triggerClasses}
              disabled={disabled}
              {...buttonProps}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, dateFormat, { locale }) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={datePickerPopoverVariants()} align="start">
            <Calendar
              {...calendarProps}
              mode="single"
              selected={value}
              onSelect={handleSelect}
              initialFocus
              locale={locale}
            />
          </PopoverContent>
        </Popover>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

        {!error && helperText && (
          <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

DatePickerCustom.displayName = "DatePickerCustom";
