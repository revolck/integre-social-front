"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/ui/custom/input";
import { cn } from "@/lib/utils";
import type { DatePickerCustomProps } from "./types";

export function DatePickerCustom({
  label,
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  helperText,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className,
  size = "md",
  fullWidth = true,
}: DatePickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar valor externo com input
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy"));
      setInternalError("");
    } else if (!value) {
      setInputValue("");
      setInternalError("");
    }
  }, [value]);

  // Função para aplicar máscara de data
  const applyDateMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  // Função para validar data
  const validateDate = (
    dateString: string
  ): { isValid: boolean; date?: Date; error?: string } => {
    if (!dateString || dateString.length < 10) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Data inválida" };
      }

      // Verificar limites de data
      if (minDate && isBefore(parsedDate, minDate)) {
        return {
          isValid: false,
          error: `Data deve ser posterior a ${format(minDate, "dd/MM/yyyy")}`,
        };
      }

      if (maxDate && isAfter(parsedDate, maxDate)) {
        return {
          isValid: false,
          error: `Data deve ser anterior a ${format(maxDate, "dd/MM/yyyy")}`,
        };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de data inválido" };
    }
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyDateMask(e.target.value);
    setInputValue(maskedValue);

    // Validar apenas quando tiver formato completo
    if (maskedValue.length === 10) {
      const validation = validateDate(maskedValue);

      if (validation.isValid && validation.date) {
        setInternalError("");
        onChange?.(validation.date);
      } else {
        setInternalError(validation.error || "Data inválida");
        onChange?.(undefined);
      }
    } else {
      setInternalError("");
      if (maskedValue === "") {
        onChange?.(undefined);
      }
    }
  };

  // Handler para seleção no calendário
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setInputValue(format(selectedDate, "dd/MM/yyyy"));
      setInternalError("");
      onChange?.(selectedDate);
    }
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handler para abrir/fechar popover
  const handleTogglePopover = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
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
              onRightIconClick={handleTogglePopover}
              maxLength={10}
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
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            disabled={(date) => {
              if (minDate && isBefore(date, minDate)) return true;
              if (maxDate && isAfter(date, maxDate)) return true;
              return false;
            }}
            initialFocus
            locale={ptBR}
            className="rounded-md border-0"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
