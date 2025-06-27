// src/components/ui/custom/date-picker/MonthYearPickerCustom.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  parse,
  isValid,
  getYear,
  getMonth,
  setMonth,
  setYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/ui/custom/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthYearPickerCustomProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function MonthYearPickerCustom({
  label,
  value,
  onChange,
  placeholder = "MM/AAAA",
  helperText,
  error,
  required = false,
  disabled = false,
  minYear = 1900,
  maxYear = 2100,
  className,
  size = "md",
  fullWidth = true,
}: MonthYearPickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Nomes dos meses
  const monthNames = [
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
  ];

  // Sincronizar valor externo com input
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "MM/yyyy"));
      setSelectedMonth(getMonth(value));
      setSelectedYear(getYear(value));
      setCurrentYear(getYear(value));
      setInternalError("");
    } else if (!value) {
      setInputValue("");
      setSelectedMonth(undefined);
      setSelectedYear(undefined);
      setInternalError("");
    }
  }, [value]);

  // Função para aplicar máscara de mês/ano
  const applyMonthYearMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 6)}`;
    }
  };

  // Função para validar mês/ano
  const validateMonthYear = (
    monthYearString: string
  ): { isValid: boolean; date?: Date; error?: string } => {
    if (!monthYearString || monthYearString.length < 7) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(monthYearString, "MM/yyyy", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Mês/ano inválido" };
      }

      const year = getYear(parsedDate);
      const month = getMonth(parsedDate) + 1; // getMonth retorna 0-11

      // Validar mês
      if (month < 1 || month > 12) {
        return { isValid: false, error: "Mês deve estar entre 01 e 12" };
      }

      // Verificar limites de ano
      if (year < minYear) {
        return {
          isValid: false,
          error: `Ano deve ser maior ou igual a ${minYear}`,
        };
      }

      if (year > maxYear) {
        return {
          isValid: false,
          error: `Ano deve ser menor ou igual a ${maxYear}`,
        };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de mês/ano inválido" };
    }
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyMonthYearMask(e.target.value);
    setInputValue(maskedValue);

    // Validar apenas quando tiver formato completo
    if (maskedValue.length === 7) {
      const validation = validateMonthYear(maskedValue);

      if (validation.isValid && validation.date) {
        setInternalError("");
        setSelectedMonth(getMonth(validation.date));
        setSelectedYear(getYear(validation.date));
        setCurrentYear(getYear(validation.date));
        onChange?.(validation.date);
      } else {
        setInternalError(validation.error || "Mês/ano inválido");
        onChange?.(undefined);
      }
    } else {
      setInternalError("");
      if (maskedValue === "") {
        onChange?.(undefined);
        setSelectedMonth(undefined);
        setSelectedYear(undefined);
      }
    }
  };

  // Handler para seleção de mês
  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);

    if (selectedYear !== undefined) {
      const newDate = setMonth(setYear(new Date(), selectedYear), month);
      setInputValue(format(newDate, "MM/yyyy"));
      setInternalError("");
      onChange?.(newDate);
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  // Handler para seleção de ano
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentYear(year);

    if (selectedMonth !== undefined) {
      const newDate = setMonth(setYear(new Date(), year), selectedMonth);
      setInputValue(format(newDate, "MM/yyyy"));
      setInternalError("");
      onChange?.(newDate);
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  // Navegação de anos
  const handlePreviousYear = () => {
    if (currentYear > minYear) {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextYear = () => {
    if (currentYear < maxYear) {
      setCurrentYear(currentYear + 1);
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
              onRightIconClick={() => !disabled && setIsOpen(!isOpen)}
              maxLength={7}
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
          <div className="p-4 space-y-4">
            {/* Seletor de ano */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousYear}
                disabled={currentYear <= minYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-lg font-semibold">{currentYear}</div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextYear}
                disabled={currentYear >= maxYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Grid de meses */}
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((monthName, index) => (
                <Button
                  key={index}
                  variant={
                    selectedMonth === index && selectedYear === currentYear
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-10 text-xs"
                  onClick={() => handleMonthSelect(index)}
                >
                  {monthName.slice(0, 3)}
                </Button>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue("");
                  setSelectedMonth(undefined);
                  setSelectedYear(undefined);
                  setInternalError("");
                  onChange?.(undefined);
                  setIsOpen(false);
                }}
                className="flex-1"
              >
                Limpar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const thisMonth = getMonth(today);
                  const thisYear = getYear(today);

                  if (thisYear >= minYear && thisYear <= maxYear) {
                    handleMonthSelect(thisMonth);
                    setCurrentYear(thisYear);
                    setSelectedYear(thisYear);
                  }
                }}
                className="flex-1"
              >
                Hoje
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
