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
import type { TimePickerCustomProps } from "./types";

export function TimePickerCustom({
  label,
  value,
  onChange,
  placeholder = "HH:mm",
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
}: TimePickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalError, setInternalError] = useState<string>("");
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

  // Sincronizar valor externo com input
  useEffect(() => {
    if (value) {
      setInputValue(value);
      setInternalError("");
    } else {
      setInputValue("");
      setInternalError("");
    }
  }, [value]);

  // Função para aplicar máscara de horário
  const applyTimeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara HH:mm
    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  };

  // Função para validar horário
  const validateTime = (
    timeString: string
  ): { isValid: boolean; error?: string } => {
    if (!timeString || timeString.length < 5) {
      return { isValid: false };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(timeString)) {
      return { isValid: false, error: "Horário inválido" };
    }

    // Verificar limites de horário
    if (minTime && timeString < minTime) {
      return {
        isValid: false,
        error: `Horário deve ser posterior a ${minTime}`,
      };
    }

    if (maxTime && timeString > maxTime) {
      return {
        isValid: false,
        error: `Horário deve ser anterior a ${maxTime}`,
      };
    }

    return { isValid: true };
  };

  // Handler para mudanças no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyTimeMask(e.target.value);
    setInputValue(maskedValue);

    // Validar apenas quando tiver formato completo
    if (maskedValue.length === 5) {
      const validation = validateTime(maskedValue);

      if (validation.isValid) {
        setInternalError("");
        onChange?.(maskedValue);
      } else {
        setInternalError(validation.error || "Horário inválido");
        onChange?.(undefined);
      }
    } else {
      setInternalError("");
      if (maskedValue === "") {
        onChange?.(undefined);
      }
    }
  };

  // Handler para seleção de horário
  const handleTimeSelect = (time: string) => {
    setInputValue(time);
    setInternalError("");
    onChange?.(time);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handler para horário atual
  const handleCurrentTime = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const validation = validateTime(currentTime);
    if (validation.isValid) {
      handleTimeSelect(currentTime);
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
              rightIcon="Clock"
              onRightIconClick={() => !disabled && setIsOpen(!isOpen)}
              maxLength={5}
              className="pr-10"
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-[200px] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Selecionar Horário
            </h4>
          </div>

          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {timeOptions.map((time) => (
                <Button
                  key={time}
                  variant={inputValue === time ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-center text-sm"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCurrentTime}
            >
              Agora
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setInputValue("");
                setInternalError("");
                onChange?.(undefined);
                setIsOpen(false);
              }}
            >
              Limpar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
