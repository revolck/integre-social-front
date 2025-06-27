"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/ui/custom/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import type { DateRangePickerCustomProps } from "./types";

export function DateRangePickerCustom({
  label,
  startDate,
  endDate,
  onChange,
  placeholder = "DD/MM/AAAA - DD/MM/AAAA",
  helperText,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className,
  size = "md",
  fullWidth = true,
}: DateRangePickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar valores externos com input
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      const rangeText = `${format(startDate, "dd/MM/yyyy")} - ${format(
        endDate,
        "dd/MM/yyyy"
      )}`;
      setInputValue(rangeText);
      setDateRange({ from: startDate, to: endDate });
      setInternalError("");
    } else if (startDate && isValid(startDate) && !endDate) {
      setInputValue(format(startDate, "dd/MM/yyyy"));
      setDateRange({ from: startDate, to: undefined });
    } else if (!startDate && !endDate) {
      setInputValue("");
      setDateRange(undefined);
      setInternalError("");
    }
  }, [startDate, endDate]);

  // Função para aplicar máscara de intervalo de datas
  const applyDateRangeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara DD/MM/AAAA - DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )} - ${numbers.slice(8, 10)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )} - ${numbers.slice(8, 10)}/${numbers.slice(10, 12)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )} - ${numbers.slice(8, 10)}/${numbers.slice(10, 12)}/${numbers.slice(
        12,
        16
      )}`;
    }
  };

  // Função para validar intervalo de datas
  const validateDateRange = (
    rangeString: string
  ): { isValid: boolean; startDate?: Date; endDate?: Date; error?: string } => {
    const parts = rangeString.split(" - ");

    // Validar data única (ainda digitando)
    if (parts.length === 1 && parts[0].length === 10) {
      try {
        const startDateParsed = parse(parts[0], "dd/MM/yyyy", new Date());

        if (!isValid(startDateParsed)) {
          return { isValid: false, error: "Data inicial inválida" };
        }

        // Verificar limites
        if (minDate && isBefore(startDateParsed, minDate)) {
          return {
            isValid: false,
            error: `Data inicial deve ser posterior a ${format(
              minDate,
              "dd/MM/yyyy"
            )}`,
          };
        }

        if (maxDate && isAfter(startDateParsed, maxDate)) {
          return {
            isValid: false,
            error: `Data inicial deve ser anterior a ${format(
              maxDate,
              "dd/MM/yyyy"
            )}`,
          };
        }

        return { isValid: true, startDate: startDateParsed };
      } catch {
        return { isValid: false, error: "Formato de data inválido" };
      }
    }

    // Validar intervalo completo
    if (
      parts.length === 2 &&
      parts[0].length === 10 &&
      parts[1].length === 10
    ) {
      try {
        const startDateParsed = parse(parts[0], "dd/MM/yyyy", new Date());
        const endDateParsed = parse(parts[1], "dd/MM/yyyy", new Date());

        if (!isValid(startDateParsed) || !isValid(endDateParsed)) {
          return {
            isValid: false,
            error: "Uma ou ambas as datas são inválidas",
          };
        }

        if (isAfter(startDateParsed, endDateParsed)) {
          return {
            isValid: false,
            error: "Data inicial deve ser anterior à data final",
          };
        }

        // Verificar limites
        if (
          minDate &&
          (isBefore(startDateParsed, minDate) ||
            isBefore(endDateParsed, minDate))
        ) {
          return {
            isValid: false,
            error: `Datas devem ser posteriores a ${format(
              minDate,
              "dd/MM/yyyy"
            )}`,
          };
        }

        if (
          maxDate &&
          (isAfter(startDateParsed, maxDate) || isAfter(endDateParsed, maxDate))
        ) {
          return {
            isValid: false,
            error: `Datas devem ser anteriores a ${format(
              maxDate,
              "dd/MM/yyyy"
            )}`,
          };
        }

        return {
          isValid: true,
          startDate: startDateParsed,
          endDate: endDateParsed,
        };
      } catch {
        return { isValid: false, error: "Formato de data inválido" };
      }
    }

    return { isValid: false };
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyDateRangeMask(e.target.value);
    setInputValue(maskedValue);

    const validation = validateDateRange(maskedValue);

    if (validation.isValid) {
      setInternalError("");
      if (validation.startDate && validation.endDate) {
        // Intervalo completo
        setDateRange({ from: validation.startDate, to: validation.endDate });
        onChange?.({
          startDate: validation.startDate,
          endDate: validation.endDate,
        });
      } else if (validation.startDate) {
        // Apenas data inicial
        setDateRange({ from: validation.startDate, to: undefined });
        onChange?.({ startDate: validation.startDate, endDate: undefined });
      }
    } else {
      if (validation.error) {
        setInternalError(validation.error);
      }
      if (maskedValue === "") {
        onChange?.({ startDate: undefined, endDate: undefined });
        setDateRange(undefined);
        setInternalError("");
      }
    }
  };

  // Handler para seleção no calendário
  const handleCalendarSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from && range?.to) {
      const rangeText = `${format(range.from, "dd/MM/yyyy")} - ${format(
        range.to,
        "dd/MM/yyyy"
      )}`;
      setInputValue(rangeText);
      setInternalError("");
      onChange?.({ startDate: range.from, endDate: range.to });
      setIsOpen(false);
      inputRef.current?.focus();
    } else if (range?.from) {
      setInputValue(format(range.from, "dd/MM/yyyy"));
      onChange?.({ startDate: range.from, endDate: undefined });
    }
  };

  // Handler para limpar seleção
  const handleClear = () => {
    setInputValue("");
    setDateRange(undefined);
    setInternalError("");
    onChange?.({ startDate: undefined, endDate: undefined });
    setIsOpen(false);
  };

  const displayError = error || internalError;

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <InputCustom
              ref={inputRef}
              label={label}
              value={inputValue}
              onChange={handleInputChange}
              placeholder={placeholder}
              helperText={helperText}
              error={displayError}
              required={required}
              disabled={disabled}
              size={size}
              fullWidth={fullWidth}
              rightIcon="Calendar"
              onRightIconClick={() => !disabled && setIsOpen(!isOpen)}
              maxLength={23}
              className="pr-10"
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="p-3">
            <CalendarComponent
              mode="range"
              selected={dateRange}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                if (minDate && isBefore(date, minDate)) return true;
                if (maxDate && isAfter(date, maxDate)) return true;
                return false;
              }}
              locale={ptBR}
              className="rounded-md border-0"
              numberOfMonths={2}
            />

            <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
