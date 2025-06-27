"use client";

import { useState, useCallback, useMemo } from "react";
import { format, isValid, parse, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UseDatePickerOptions {
  initialValue?: Date;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  onValidate?: (date: Date | undefined) => string | undefined;
}

interface UseDatePickerReturn {
  value: Date | undefined;
  setValue: (date: Date | undefined) => void;
  formattedValue: string;
  error: string | undefined;
  isValid: boolean;
  clear: () => void;
  setToday: () => void;
  reset: () => void;
}

export function useDatePicker({
  initialValue,
  minDate,
  maxDate,
  required = false,
  onValidate,
}: UseDatePickerOptions = {}): UseDatePickerReturn {
  const [value, setValue] = useState<Date | undefined>(initialValue);
  const [error, setError] = useState<string | undefined>();

  // Validar data
  const validateDate = useCallback(
    (date: Date | undefined): string | undefined => {
      // Validação customizada primeiro
      if (onValidate) {
        const customError = onValidate(date);
        if (customError) return customError;
      }

      // Validação obrigatória
      if (required && !date) {
        return "Este campo é obrigatório";
      }

      // Se não há data e não é obrigatório, é válido
      if (!date) return undefined;

      // Verificar se é uma data válida
      if (!isValid(date)) {
        return "Data inválida";
      }

      // Verificar limites
      if (minDate && isBefore(date, minDate)) {
        return `Data deve ser posterior a ${format(minDate, "dd/MM/yyyy")}`;
      }

      if (maxDate && isAfter(date, maxDate)) {
        return `Data deve ser anterior a ${format(maxDate, "dd/MM/yyyy")}`;
      }

      return undefined;
    },
    [minDate, maxDate, required, onValidate]
  );

  // Atualizar valor com validação
  const handleSetValue = useCallback(
    (newDate: Date | undefined) => {
      setValue(newDate);
      const validationError = validateDate(newDate);
      setError(validationError);
    },
    [validateDate]
  );

  // Valor formatado
  const formattedValue = useMemo(() => {
    if (!value || !isValid(value)) return "";
    return format(value, "dd/MM/yyyy");
  }, [value]);

  // Status de validação
  const isValidValue = useMemo(() => {
    return !error;
  }, [error]);

  // Limpar valor
  const clear = useCallback(() => {
    handleSetValue(undefined);
  }, [handleSetValue]);

  // Definir para hoje
  const setToday = useCallback(() => {
    handleSetValue(new Date());
  }, [handleSetValue]);

  // Reset para valor inicial
  const reset = useCallback(() => {
    handleSetValue(initialValue);
  }, [handleSetValue, initialValue]);

  return {
    value,
    setValue: handleSetValue,
    formattedValue,
    error,
    isValid: isValidValue,
    clear,
    setToday,
    reset,
  };
}

// Hook para range de datas
interface UseDateRangeOptions {
  initialStartDate?: Date;
  initialEndDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  maxDuration?: number; // em dias
}

interface UseDateRangeReturn {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  setRange: (start: Date | undefined, end: Date | undefined) => void;
  formattedRange: string;
  error: string | undefined;
  isValid: boolean;
  duration: number | undefined; // em dias
  clear: () => void;
  reset: () => void;
}

export function useDateRange({
  initialStartDate,
  initialEndDate,
  minDate,
  maxDate,
  required = false,
  maxDuration,
}: UseDateRangeOptions = {}): UseDateRangeReturn {
  const [startDate, setStartDateState] = useState<Date | undefined>(
    initialStartDate
  );
  const [endDate, setEndDateState] = useState<Date | undefined>(initialEndDate);
  const [error, setError] = useState<string | undefined>();

  // Validar range
  const validateRange = useCallback(
    (start: Date | undefined, end: Date | undefined): string | undefined => {
      // Validação obrigatória
      if (required && (!start || !end)) {
        return "Período completo é obrigatório";
      }

      // Se não há datas e não é obrigatório, é válido
      if (!start && !end) return undefined;

      // Verifica recursivamente se algum submenu está ativo
      if (start && !end) return undefined; // Ainda selecionando
      if (!start && end) return "Data inicial é obrigatória";

      // Ambas as datas existem - validar
      if (start && end) {
        if (!isValid(start) || !isValid(end)) {
          return "Uma ou ambas as datas são inválidas";
        }

        if (isAfter(start, end)) {
          return "Data inicial deve ser anterior à data final";
        }

        // Verificar limites
        if (minDate && (isBefore(start, minDate) || isBefore(end, minDate))) {
          return `Datas devem ser posteriores a ${format(
            minDate,
            "dd/MM/yyyy"
          )}`;
        }

        if (maxDate && (isAfter(start, maxDate) || isAfter(end, maxDate))) {
          return `Datas devem ser anteriores a ${format(
            maxDate,
            "dd/MM/yyyy"
          )}`;
        }

        // Verificar duração máxima
        if (maxDuration) {
          const durationInMs = end.getTime() - start.getTime();
          const durationInDays = Math.ceil(
            durationInMs / (1000 * 60 * 60 * 24)
          );
          if (durationInDays > maxDuration) {
            return `Período não pode exceder ${maxDuration} dias`;
          }
        }
      }

      return undefined;
    },
    [minDate, maxDate, required, maxDuration]
  );

  // Atualizar data inicial
  const setStartDate = useCallback(
    (date: Date | undefined) => {
      setStartDateState(date);
      const validationError = validateRange(date, endDate);
      setError(validationError);
    },
    [endDate, validateRange]
  );

  // Atualizar data final
  const setEndDate = useCallback(
    (date: Date | undefined) => {
      setEndDateState(date);
      const validationError = validateRange(startDate, date);
      setError(validationError);
    },
    [startDate, validateRange]
  );

  // Atualizar range completo
  const setRange = useCallback(
    (start: Date | undefined, end: Date | undefined) => {
      setStartDateState(start);
      setEndDateState(end);
      const validationError = validateRange(start, end);
      setError(validationError);
    },
    [validateRange]
  );

  // Valor formatado
  const formattedRange = useMemo(() => {
    if (!startDate || !isValid(startDate)) return "";
    if (!endDate || !isValid(endDate)) return format(startDate, "dd/MM/yyyy");
    return `${format(startDate, "dd/MM/yyyy")} - ${format(
      endDate,
      "dd/MM/yyyy"
    )}`;
  }, [startDate, endDate]);

  // Duração em dias
  const duration = useMemo(() => {
    if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate))
      return undefined;
    const durationInMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  // Status de validação
  const isValidValue = useMemo(() => {
    return !error;
  }, [error]);

  // Limpar valores
  const clear = useCallback(() => {
    setRange(undefined, undefined);
  }, [setRange]);

  // Reset para valores iniciais
  const reset = useCallback(() => {
    setRange(initialStartDate, initialEndDate);
  }, [setRange, initialStartDate, initialEndDate]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setRange,
    formattedRange,
    error,
    isValid: isValidValue,
    duration,
    clear,
    reset,
  };
}
