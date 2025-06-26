"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  datePickerContainerVariants,
  datePickerTriggerVariants,
} from "./variants";
import type { MonthYearPickerCustomProps } from "./types";

/**
 * Componente MonthYearPickerCustom - Seletor de mês e ano customizado
 */
export const MonthYearPickerCustom = React.forwardRef<
  HTMLButtonElement,
  MonthYearPickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione mês e ano",
      disabled = false,
      required = false,
      className,
      dateFormat = "MMMM yyyy",
      locale = ptBR,
      value,
      onChange,
      minYear = 1900,
      maxYear = 2100,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectedMonth, setSelectedMonth] = React.useState(
      value ? value.getMonth() : new Date().getMonth()
    );
    const [selectedYear, setSelectedYear] = React.useState(
      value ? value.getFullYear() : new Date().getFullYear()
    );

    const months = React.useMemo(
      () => [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ],
      []
    );

    const years = React.useMemo(() => {
      const yearList = [];
      for (let year = maxYear; year >= minYear; year--) {
        yearList.push(year);
      }
      return yearList;
    }, [minYear, maxYear]);

    const handleMonthChange = (month: string) => {
      const monthIndex = parseInt(month);
      setSelectedMonth(monthIndex);
      const newDate = new Date(selectedYear, monthIndex, 1);
      onChange?.(newDate);
    };

    const handleYearChange = (year: string) => {
      const yearValue = parseInt(year);
      setSelectedYear(yearValue);
      const newDate = new Date(yearValue, selectedMonth, 1);
      onChange?.(newDate);
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
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, dateFormat, { locale }) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <Select
                value={selectedMonth.toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="w-full"
                onClick={() => setOpen(false)}
                disabled={!value}
              >
                Confirmar
              </Button>
            </div>
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

MonthYearPickerCustom.displayName = "MonthYearPickerCustom";
