"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  format,
  parse,
  isValid,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/ui/custom/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { DateTimePickerCustomProps } from "./types";

export function DateTimePickerCustom({
  label,
  value,
  onChange,
  placeholder = "DD/MM/AAAA HH:mm",
  helperText,
  error,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  minTime,
  maxTime,
  timeInterval = 15,
  className,
  size = "md",
  fullWidth = true,
}: DateTimePickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Gerar opções de horário
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeInterval) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Verificar limites de horário
        if (minTime && timeString < minTime) continue;
        if (maxTime && timeString > maxTime) continue;

        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Sincronizar valor externo com input
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "dd/MM/yyyy HH:mm"));
      setSelectedDate(value);
      setSelectedTime(format(value, "HH:mm"));
      setInternalError("");
    } else if (!value) {
      setInputValue("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setInternalError("");
    }
  }, [value]);

  // Função para aplicar máscara de data e hora
  const applyDateTimeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara DD/MM/AAAA HH:mm
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
      )} ${numbers.slice(8, 10)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )} ${numbers.slice(8, 10)}:${numbers.slice(10, 12)}`;
    }
  };

  // Função para validar data e hora
  const validateDateTime = (
    dateTimeString: string
  ): { isValid: boolean; date?: Date; error?: string } => {
    if (!dateTimeString || dateTimeString.length < 16) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(dateTimeString, "dd/MM/yyyy HH:mm", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Data/hora inválida" };
      }

      // Verificar limites de data
      if (minDate && isBefore(parsedDate, minDate)) {
        return {
          isValid: false,
          error: `Data deve ser posterior a ${format(
            minDate,
            "dd/MM/yyyy HH:mm"
          )}`,
        };
      }

      if (maxDate && isAfter(parsedDate, maxDate)) {
        return {
          isValid: false,
          error: `Data deve ser anterior a ${format(
            maxDate,
            "dd/MM/yyyy HH:mm"
          )}`,
        };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de data/hora inválido" };
    }
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyDateTimeMask(e.target.value);
    setInputValue(maskedValue);

    // Validar apenas quando tiver formato completo
    if (maskedValue.length === 16) {
      const validation = validateDateTime(maskedValue);

      if (validation.isValid && validation.date) {
        setInternalError("");
        setSelectedDate(validation.date);
        setSelectedTime(format(validation.date, "HH:mm"));
        onChange?.(validation.date);
      } else {
        setInternalError(validation.error || "Data/hora inválida");
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
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);

      // Se já tem horário selecionado, combinar
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const combinedDate = setMinutes(setHours(date, hours), minutes);
        setInputValue(format(combinedDate, "dd/MM/yyyy HH:mm"));
        onChange?.(combinedDate);
      } else {
        // Usar horário atual se não tiver selecionado
        const now = new Date();
        const combinedDate = setMinutes(
          setHours(date, now.getHours()),
          now.getMinutes()
        );
        setInputValue(format(combinedDate, "dd/MM/yyyy HH:mm"));
        setSelectedTime(format(combinedDate, "HH:mm"));
        onChange?.(combinedDate);
      }
    }
  };

  // Handler para seleção de horário
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);

    if (selectedDate) {
      const [hours, minutes] = time.split(":").map(Number);
      const combinedDate = setMinutes(setHours(selectedDate, hours), minutes);
      setInputValue(format(combinedDate, "dd/MM/yyyy HH:mm"));
      onChange?.(combinedDate);
    }
  };

  // Handler para confirmar seleção
  const handleConfirm = () => {
    setIsOpen(false);
    inputRef.current?.focus();
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
              maxLength={16}
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
          <div className="flex">
            {/* Calendário */}
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                if (minDate && isBefore(date, minDate)) return true;
                if (maxDate && isAfter(date, maxDate)) return true;
                return false;
              }}
              locale={ptBR}
              className="rounded-md border-0"
            />

            {/* Seletor de horário */}
            <div className="border-l border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário
                </h4>
              </div>

              <ScrollArea className="h-[200px] w-[120px]">
                <div className="p-2 space-y-1">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={!selectedDate || !selectedTime}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
