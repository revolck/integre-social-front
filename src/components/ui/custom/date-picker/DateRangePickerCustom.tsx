"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  parse,
  isValid,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  subDays,
  startOfWeek,
  endOfWeek,
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
import type { DateRangePickerCustomProps } from "./types";

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface QuickOption {
  label: string;
  value: () => DateRange;
}

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
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));
  const [isMobile, setIsMobile] = useState(false);

  // Estados temporários para seleção
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(
    startDate
  );
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);
  const [selectionStep, setSelectionStep] = useState<"start" | "end">("start");
  const [selectedQuickOption, setSelectedQuickOption] = useState<string | null>(
    null
  );

  // Estados para os campos de data individuais
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Nomes dos dias da semana
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Opções rápidas
  const quickOptions: QuickOption[] = [
    {
      label: "Hoje",
      value: () => {
        const today = new Date();
        return { startDate: today, endDate: today };
      },
    },
    {
      label: "Últimos 7 dias",
      value: () => {
        const today = new Date();
        return { startDate: subDays(today, 6), endDate: today };
      },
    },
    {
      label: "Últimos 14 dias",
      value: () => {
        const today = new Date();
        return { startDate: subDays(today, 13), endDate: today };
      },
    },
    {
      label: "Últimos 30 dias",
      value: () => {
        const today = new Date();
        return { startDate: subDays(today, 29), endDate: today };
      },
    },
    {
      label: "Esta semana",
      value: () => {
        const today = new Date();
        return {
          startDate: startOfWeek(today, { weekStartsOn: 0 }),
          endDate: endOfWeek(today, { weekStartsOn: 0 }),
        };
      },
    },
    {
      label: "Últimos 3 meses",
      value: () => {
        const today = new Date();
        return { startDate: subMonths(today, 3), endDate: today };
      },
    },
    {
      label: "Últimos 6 meses",
      value: () => {
        const today = new Date();
        return { startDate: subMonths(today, 6), endDate: today };
      },
    },
  ];

  // Sincronizar valores externos
  useEffect(() => {
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      const formattedRange = `${format(startDate, "dd/MM/yyyy")} - ${format(
        endDate,
        "dd/MM/yyyy"
      )}`;
      setInputValue(formattedRange);
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setStartDateInput(format(startDate, "dd/MM/yyyy"));
      setEndDateInput(format(endDate, "dd/MM/yyyy"));
      setInternalError("");
    } else if (startDate && isValid(startDate)) {
      setInputValue(format(startDate, "dd/MM/yyyy") + " - ");
      setTempStartDate(startDate);
      setTempEndDate(undefined);
      setStartDateInput(format(startDate, "dd/MM/yyyy"));
      setEndDateInput("");
    } else {
      setInputValue("");
      setTempStartDate(undefined);
      setTempEndDate(undefined);
      setStartDateInput("");
      setEndDateInput("");
    }
  }, [startDate, endDate]);

  // Aplicar máscara de range de datas
  const applyDateRangeMask = (value: string): string => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 8) {
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 4)
        return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
      if (numbers.length <= 8)
        return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
          4,
          8
        )}`;
    } else {
      const firstDate = `${numbers.slice(0, 2)}/${numbers.slice(
        2,
        4
      )}/${numbers.slice(4, 8)}`;
      const secondNumbers = numbers.slice(8);

      if (secondNumbers.length <= 2) return `${firstDate} - ${secondNumbers}`;
      if (secondNumbers.length <= 4)
        return `${firstDate} - ${secondNumbers.slice(
          0,
          2
        )}/${secondNumbers.slice(2)}`;
      return `${firstDate} - ${secondNumbers.slice(0, 2)}/${secondNumbers.slice(
        2,
        4
      )}/${secondNumbers.slice(4, 8)}`;
    }

    return value;
  };

  // Handler para mudanças no input principal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyDateRangeMask(e.target.value);
    setInputValue(maskedValue);
    setSelectedQuickOption(null);

    if (maskedValue.includes(" - ") && maskedValue.length === 23) {
      const [startStr, endStr] = maskedValue.split(" - ");

      try {
        const parsedStartDate = parse(startStr, "dd/MM/yyyy", new Date());
        const parsedEndDate = parse(endStr, "dd/MM/yyyy", new Date());

        if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
          if (
            isBefore(parsedStartDate, parsedEndDate) ||
            isSameDay(parsedStartDate, parsedEndDate)
          ) {
            setTempStartDate(parsedStartDate);
            setTempEndDate(parsedEndDate);
            setStartDateInput(startStr);
            setEndDateInput(endStr);
            setInternalError("");
          } else {
            setInternalError("Data inicial deve ser anterior à data final");
          }
        }
      } catch {
        setInternalError("Formato de data inválido");
      }
    }
  };

  // Handler para campos de data individuais
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateRangeMask(e.target.value).split(" - ")[0];
    setStartDateInput(masked);

    if (masked.length === 10) {
      try {
        const parsedDate = parse(masked, "dd/MM/yyyy", new Date());
        if (isValid(parsedDate)) {
          setTempStartDate(parsedDate);
          updateMainInput(parsedDate, tempEndDate);
        }
      } catch {}
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyDateRangeMask(e.target.value).split(" - ")[0];
    setEndDateInput(masked);

    if (masked.length === 10) {
      try {
        const parsedDate = parse(masked, "dd/MM/yyyy", new Date());
        if (isValid(parsedDate)) {
          setTempEndDate(parsedDate);
          updateMainInput(tempStartDate, parsedDate);
        }
      } catch {}
    }
  };

  // Atualizar input principal
  const updateMainInput = (start?: Date, end?: Date) => {
    if (start && end) {
      setInputValue(
        `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`
      );
    } else if (start) {
      setInputValue(format(start, "dd/MM/yyyy") + " - ");
    } else {
      setInputValue("");
    }
  };

  // Handler para seleção de opção rápida
  const handleQuickOptionSelect = (
    option: QuickOption,
    optionLabel: string
  ) => {
    const range = option.value();
    setTempStartDate(range.startDate);
    setTempEndDate(range.endDate);
    setSelectedQuickOption(optionLabel);
    setSelectionStep("start");

    if (range.startDate && range.endDate) {
      const startStr = format(range.startDate, "dd/MM/yyyy");
      const endStr = format(range.endDate, "dd/MM/yyyy");
      setStartDateInput(startStr);
      setEndDateInput(endStr);
      setInputValue(`${startStr} - ${endStr}`);
      setInternalError("");
    }
  };

  // Handler para seleção de data no calendário
  const handleDateSelect = (date: Date) => {
    setSelectedQuickOption(null);

    if (minDate && isBefore(date, startOfDay(minDate))) return;
    if (maxDate && isAfter(date, endOfDay(maxDate))) return;

    if (selectionStep === "start") {
      setTempStartDate(date);
      setTempEndDate(undefined);
      setSelectionStep("end");
      const dateStr = format(date, "dd/MM/yyyy");
      setStartDateInput(dateStr);
      setEndDateInput("");
      setInputValue(dateStr + " - ");
    } else {
      if (tempStartDate) {
        let finalStart = tempStartDate;
        let finalEnd = date;

        if (isBefore(date, tempStartDate)) {
          finalStart = date;
          finalEnd = tempStartDate;
        }

        setTempStartDate(finalStart);
        setTempEndDate(finalEnd);
        setStartDateInput(format(finalStart, "dd/MM/yyyy"));
        setEndDateInput(format(finalEnd, "dd/MM/yyyy"));
        setInputValue(
          `${format(finalStart, "dd/MM/yyyy")} - ${format(
            finalEnd,
            "dd/MM/yyyy"
          )}`
        );
        setInternalError("");
      }
    }
  };

  // Navegação dos calendários
  const handleLeftMonthChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setLeftMonth(subMonths(leftMonth, 1));
      if (!isMobile) setRightMonth(subMonths(rightMonth, 1));
    } else {
      setLeftMonth(addMonths(leftMonth, 1));
      if (!isMobile) setRightMonth(addMonths(rightMonth, 1));
    }
  };

  // Gerar dias do calendário
  const generateCalendarDays = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startWeek, end: endWeek });
  };

  // Verificar estados das datas
  const isDateInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return !isBefore(date, tempStartDate) && !isAfter(date, tempEndDate);
  };

  const isDateRangeEnd = (date: Date) => {
    return (
      (tempStartDate && isSameDay(date, tempStartDate)) ||
      (tempEndDate && isSameDay(date, tempEndDate))
    );
  };

  // Ações
  const handleConfirm = () => {
    if (tempStartDate && tempEndDate) {
      onChange?.({
        startDate: tempStartDate,
        endDate: tempEndDate,
      });
      setIsOpen(false);
      setSelectionStep("start");
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    setInputValue("");
    setStartDateInput("");
    setEndDateInput("");
    setInternalError("");
    setSelectionStep("start");
    setSelectedQuickOption(null);
    onChange?.({});
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setSelectionStep("start");
    setSelectedQuickOption(null);
    setIsOpen(false);

    if (startDate && endDate) {
      const startStr = format(startDate, "dd/MM/yyyy");
      const endStr = format(endDate, "dd/MM/yyyy");
      setInputValue(`${startStr} - ${endStr}`);
      setStartDateInput(startStr);
      setEndDateInput(endStr);
    } else {
      setInputValue("");
      setStartDateInput("");
      setEndDateInput("");
    }
  };

  const displayError = error || internalError;
  const canConfirm = tempStartDate && tempEndDate && !internalError;

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
          className={cn(
            "p-0 border border-gray-200 dark:border-gray-700 shadow-xl",
            isMobile ? "w-[340px] max-w-[95vw]" : "w-auto max-w-5xl"
          )}
          align={isMobile ? "center" : "start"}
          side="bottom"
          sideOffset={4}
        >
          <div
            className={cn(
              "bg-white dark:bg-gray-900",
              isMobile ? "flex flex-col" : "flex"
            )}
          >
            {/* Painel de opções rápidas - apenas desktop */}
            {!isMobile && (
              <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                {/* Opções rápidas */}
                <div className="space-y-1 mb-4">
                  {quickOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() =>
                        handleQuickOptionSelect(option, option.label)
                      }
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors ",
                        selectedQuickOption === option.label
                          ? "bg-[var(--global-modal-projects-select)] dark:bg-green-900 dark:text-green-100"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Status da seleção */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  {tempStartDate && tempEndDate ? (
                    <div className="text-center space-y-2">
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                        {format(tempStartDate, "dd/MM/yyyy")} —{" "}
                        {format(tempEndDate, "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {Math.ceil(
                          (tempEndDate.getTime() - tempStartDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{" "}
                        dias selecionados
                      </div>
                    </div>
                  ) : tempStartDate ? (
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center mb-2">
                        Período Selecionado
                      </div>
                      <div className="text-xs">
                        Início: {format(tempStartDate, "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-[var(--global-title-secondary)] mt-2">
                        Agora selecione a data final
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                      Vamos começar? Escolha um período no calendário.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header mobile - instrução simples */}
            {isMobile && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {!tempStartDate && !tempEndDate
                    ? "Selecione o período desejado"
                    : selectionStep === "start"
                    ? "Selecione a data inicial"
                    : "Selecione a data final"}
                </div>

                {tempStartDate && tempEndDate && (
                  <div className="text-center mt-2 space-y-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(tempStartDate, "dd/MM/yyyy")} —{" "}
                      {format(tempEndDate, "dd/MM/yyyy")}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {Math.ceil(
                        (tempEndDate.getTime() - tempStartDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1}{" "}
                      dias selecionados
                    </div>
                  </div>
                )}

                {tempStartDate && !tempEndDate && (
                  <div className="text-center mt-2">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Início: {format(tempStartDate, "dd/MM/yyyy")}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Toque na data final
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Área dos calendários */}
            <div
              className={cn(
                "bg-white dark:bg-gray-900",
                isMobile ? "p-4 space-y-4" : "p-6 space-y-6"
              )}
            >
              {/* Layout responsivo dos calendários */}
              <div
                className={cn(
                  isMobile ? "space-y-4" : "flex gap-12 justify-center"
                )}
              >
                {/* Calendário principal (ou esquerdo no desktop) */}
                <div className="space-y-3">
                  {/* Cabeçalho do calendário */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeftMonthChange("prev")}
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-lg font-semibold text-center flex-1 text-gray-900 dark:text-white">
                      {format(leftMonth, "MMMM yyyy", { locale: ptBR })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLeftMonthChange("next")}
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Cabeçalho dos dias da semana */}
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day) => (
                      <div
                        key={`main-${day}`}
                        className={cn(
                          "text-center text-xs font-medium text-gray-500 py-2",
                          isMobile ? "w-10" : "w-10"
                        )}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid de dias */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(leftMonth).map((date) => {
                      const isCurrentMonth = isSameMonth(date, leftMonth);
                      const isDisabled =
                        !isCurrentMonth ||
                        (minDate && isBefore(date, startOfDay(minDate))) ||
                        (maxDate && isAfter(date, endOfDay(maxDate)));

                      const isInRange = isDateInRange(date);
                      const isRangeEnd = isDateRangeEnd(date);
                      const isToday = isSameDay(date, new Date());

                      return (
                        <Button
                          key={date.toISOString()}
                          variant="ghost"
                          size="sm"
                          disabled={isDisabled}
                          onClick={() => handleDateSelect(date)}
                          className={cn(
                            "p-0 font-normal text-sm rounded-md",
                            isMobile ? "h-10 w-10" : "h-10 w-10",
                            !isCurrentMonth &&
                              "text-gray-300 dark:text-gray-600",
                            isToday &&
                              isCurrentMonth &&
                              "bg-green-100 text-green-900 hover:bg-green-500 hover:text-white",
                            isRangeEnd &&
                              "bg-green-500 text-white hover:bg-green-600 hover:text-white",
                            isInRange &&
                              !isRangeEnd &&
                              "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
                            isDisabled && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {format(date, "d")}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Calendário direito (apenas no desktop) */}
                {!isMobile && (
                  <div className="space-y-3">
                    {/* Cabeçalho do calendário direito */}
                    <div className="flex items-center justify-between">
                      <div className="w-8" />
                      <div className="text-lg font-semibold text-center flex-1 text-gray-900 dark:text-white">
                        {format(rightMonth, "MMMM yyyy", { locale: ptBR })}
                      </div>
                      <div className="w-8" />
                    </div>

                    {/* Cabeçalho dos dias da semana */}
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <div
                          key={`right-${day}`}
                          className="text-center text-xs font-medium text-gray-500 py-2 w-10"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Grid de dias */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(rightMonth).map((date) => {
                        const isCurrentMonth = isSameMonth(date, rightMonth);
                        const isDisabled =
                          !isCurrentMonth ||
                          (minDate && isBefore(date, startOfDay(minDate))) ||
                          (maxDate && isAfter(date, endOfDay(maxDate)));

                        const isInRange = isDateInRange(date);
                        const isRangeEnd = isDateRangeEnd(date);
                        const isToday = isSameDay(date, new Date());

                        return (
                          <Button
                            key={date.toISOString()}
                            variant="ghost"
                            size="sm"
                            disabled={isDisabled}
                            onClick={() => handleDateSelect(date)}
                            className={cn(
                              "h-10 w-10 p-0 font-normal text-sm rounded-md",
                              !isCurrentMonth &&
                                "text-gray-300 dark:text-gray-600",
                              isToday &&
                                isCurrentMonth &&
                                "bg-gray-100 text-gray-900 dark:bg-gray-700",
                              isRangeEnd &&
                                "bg-green-500 text-white hover:bg-green-600",
                              isInRange &&
                                !isRangeEnd &&
                                "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
                              isDisabled && "opacity-30 cursor-not-allowed"
                            )}
                          >
                            {format(date, "d")}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div
                className={cn(
                  "pt-4 border-t border-gray-200 dark:border-gray-700",
                  isMobile
                    ? "flex flex-col gap-3"
                    : "flex justify-between items-center"
                )}
              >
                {/* Lado esquerdo - Limpar e campos de data (desktop) */}
                <div
                  className={cn(
                    "flex items-center gap-4",
                    isMobile && "w-full justify-center"
                  )}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className={cn(isMobile && "w-full")}
                  >
                    Limpar
                  </Button>

                  {/* Campos de data - apenas desktop */}
                </div>

                {/* Lado direito - Cancelar e Aplicar */}
                <div className={cn("flex gap-2", isMobile && "w-full")}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className={cn(isMobile && "flex-1")}
                  >
                    Cancelar
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleConfirm}
                    disabled={!canConfirm}
                    className={cn(
                      "bg-green-500 hover:bg-green-600 text-white",
                      isMobile && "flex-1"
                    )}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
