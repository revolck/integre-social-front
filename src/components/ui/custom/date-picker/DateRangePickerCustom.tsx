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
} from "./variants";
import type { DateRangePickerCustomProps } from "./types";

/**
 * Componente DateRangePickerCustom - Seletor de intervalo de datas customizado
 */
export const DateRangePickerCustom = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione o período",
      disabled = false,
      required = false,
      className,
      dateFormat = "dd/MM/yyyy",
      locale = ptBR,
      startDate,
      endDate,
      onChange,
      maxDays,
      minDays,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [range, setRange] = React.useState<{
      from: Date | undefined;
      to: Date | undefined;
    }>({
      from: startDate,
      to: endDate,
    });

    const handleSelect = (dates: any) => {
      setRange(dates);

      if (dates?.from && dates?.to) {
        onChange?.({
          startDate: dates.from,
          endDate: dates.to,
        });
        setOpen(false);
      }
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
        hasValue: !!startDate || !!endDate,
        hasError: !!error,
      })
    );

    const displayValue = React.useMemo(() => {
      if (startDate && endDate) {
        return `${format(startDate, dateFormat, { locale })} - ${format(
          endDate,
          dateFormat,
          { locale }
        )}`;
      }
      if (startDate) {
        return `${format(startDate, dateFormat, { locale })} - ...`;
      }
      return placeholder;
    }, [startDate, endDate, dateFormat, locale, placeholder]);

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
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayValue}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleSelect}
              initialFocus
              locale={locale}
              numberOfMonths={2}
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

DateRangePickerCustom.displayName = "DateRangePickerCustom";
