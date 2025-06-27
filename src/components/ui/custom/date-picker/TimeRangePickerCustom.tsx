"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { InputCustom } from "@/components/ui/custom/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TimeRangePickerCustomProps } from "./types";

export function TimeRangePickerCustom({
  label,
  startTime,
  endTime,
  onChange,
  placeholder = "HH:mm - HH:mm",
  helperText,
  error,
  required = false,
  disabled = false,
  minTime,
  maxTime,
  interval = 15,
  className,
  size = "md",
  fullWidth = true,
}: TimeRangePickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Gerar opções de horário
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
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

  // Sincronizar valores externos com input
  useEffect(() => {
    if (startTime && endTime) {
      const rangeText = `${startTime} - ${endTime}`;
      setInputValue(rangeText);
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
      setInternalError("");
    } else if (startTime && !endTime) {
      setInputValue(startTime);
      setSelectedStartTime(startTime);
      setSelectedEndTime("");
    } else if (!startTime && !endTime) {
      setInputValue("");
      setSelectedStartTime("");
      setSelectedEndTime("");
      setInternalError("");
    }
  }, [startTime, endTime]);

  // Função para aplicar máscara de intervalo de horário
  const applyTimeRangeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara HH:mm - HH:mm
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)} - ${numbers.slice(
        4,
        6
      )}`;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)} - ${numbers.slice(
        4,
        6
      )}:${numbers.slice(6, 8)}`;
    }
  };

  // Função para validar intervalo de horário
  const validateTimeRange = (
    rangeString: string
  ): {
    isValid: boolean;
    startTime?: string;
    endTime?: string;
    error?: string;
  } => {
    const parts = rangeString.split(" - ");

    // Validar horário único (ainda digitando)
    if (parts.length === 1 && parts[0].length === 5) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timeRegex.test(parts[0])) {
        return { isValid: false, error: "Horário inicial inválido" };
      }

      // Verificar limites
      if (minTime && parts[0] < minTime) {
        return {
          isValid: false,
          error: `Horário inicial deve ser posterior a ${minTime}`,
        };
      }

      if (maxTime && parts[0] > maxTime) {
        return {
          isValid: false,
          error: `Horário inicial deve ser anterior a ${maxTime}`,
        };
      }

      return { isValid: true, startTime: parts[0] };
    }

    // Validar intervalo completo
    if (parts.length === 2 && parts[0].length === 5 && parts[1].length === 5) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

      if (!timeRegex.test(parts[0]) || !timeRegex.test(parts[1])) {
        return {
          isValid: false,
          error: "Um ou ambos os horários são inválidos",
        };
      }

      if (parts[0] >= parts[1]) {
        return {
          isValid: false,
          error: "Horário inicial deve ser anterior ao horário final",
        };
      }

      // Verificar limites
      if (minTime && (parts[0] < minTime || parts[1] < minTime)) {
        return {
          isValid: false,
          error: `Horários devem ser posteriores a ${minTime}`,
        };
      }

      if (maxTime && (parts[0] > maxTime || parts[1] > maxTime)) {
        return {
          isValid: false,
          error: `Horários devem ser anteriores a ${maxTime}`,
        };
      }

      return { isValid: true, startTime: parts[0], endTime: parts[1] };
    }

    return { isValid: false };
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyTimeRangeMask(e.target.value);
    setInputValue(maskedValue);

    const validation = validateTimeRange(maskedValue);

    if (validation.isValid) {
      setInternalError("");
      if (validation.startTime && validation.endTime) {
        // Intervalo completo
        setSelectedStartTime(validation.startTime);
        setSelectedEndTime(validation.endTime);
        onChange?.({
          startTime: validation.startTime,
          endTime: validation.endTime,
        });
      } else if (validation.startTime) {
        // Apenas horário inicial
        setSelectedStartTime(validation.startTime);
        setSelectedEndTime("");
        onChange?.({ startTime: validation.startTime, endTime: undefined });
      }
    } else {
      if (validation.error) {
        setInternalError(validation.error);
      }
      if (maskedValue === "") {
        onChange?.({ startTime: undefined, endTime: undefined });
        setSelectedStartTime("");
        setSelectedEndTime("");
        setInternalError("");
      }
    }
  };

  // Handler para seleção de horário inicial
  const handleStartTimeSelect = (time: string) => {
    setSelectedStartTime(time);

    if (selectedEndTime) {
      if (time < selectedEndTime) {
        const rangeText = `${time} - ${selectedEndTime}`;
        setInputValue(rangeText);
        setInternalError("");
        onChange?.({ startTime: time, endTime: selectedEndTime });
      } else {
        setInternalError("Horário inicial deve ser anterior ao horário final");
      }
    } else {
      setInputValue(time);
      onChange?.({ startTime: time, endTime: undefined });
    }
  };

  // Handler para seleção de horário final
  const handleEndTimeSelect = (time: string) => {
    setSelectedEndTime(time);

    if (selectedStartTime) {
      if (selectedStartTime < time) {
        const rangeText = `${selectedStartTime} - ${time}`;
        setInputValue(rangeText);
        setInternalError("");
        onChange?.({ startTime: selectedStartTime, endTime: time });
        setIsOpen(false);
        inputRef.current?.focus();
      } else {
        setInternalError("Horário final deve ser posterior ao horário inicial");
      }
    }
  };

  // Handler para limpar seleção
  const handleClear = () => {
    setInputValue("");
    setSelectedStartTime("");
    setSelectedEndTime("");
    setInternalError("");
    onChange?.({ startTime: undefined, endTime: undefined });
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
              rightIcon="Clock"
              onRightIconClick={() => !disabled && setIsOpen(!isOpen)}
              maxLength={13}
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
            {/* Horário inicial */}
            <div className="border-r border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium">Horário Inicial</h4>
              </div>

              <ScrollArea className="h-[200px] w-[120px]">
                <div className="p-2 space-y-1">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={selectedStartTime === time ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => handleStartTimeSelect(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Horário final */}
            <div>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium">Horário Final</h4>
              </div>

              <ScrollArea className="h-[200px] w-[120px]">
                <div className="p-2 space-y-1">
                  {timeOptions.map((time) => (
                    <Button
                      key={time}
                      variant={selectedEndTime === time ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-center text-xs"
                      onClick={() => handleEndTimeSelect(time)}
                      disabled={!selectedStartTime || time <= selectedStartTime}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
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
              disabled={!selectedStartTime || !selectedEndTime}
            >
              Confirmar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
