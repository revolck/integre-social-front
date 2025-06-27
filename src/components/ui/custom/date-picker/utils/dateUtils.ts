import {
  format,
  parse,
  isValid,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  addDays,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Utilitários para formatação e validação de datas
 */
export class DateUtils {
  /**
   * Aplica máscara de data ao valor digitado
   */
  static applyDateMask(value: string): string {
    const numbers = value.replace(/\D/g, "");

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
  }

  /**
   * Aplica máscara de data e hora ao valor digitado
   */
  static applyDateTimeMask(value: string): string {
    const numbers = value.replace(/\D/g, "");

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
  }

  /**
   * Aplica máscara de horário ao valor digitado
   */
  static applyTimeMask(value: string): string {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
    }
  }

  /**
   * Aplica máscara de mês/ano ao valor digitado
   */
  static applyMonthYearMask(value: string): string {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 6)}`;
    }
  }

  /**
   * Valida formato de data (DD/MM/AAAA)
   */
  static validateDateFormat(dateString: string): {
    isValid: boolean;
    date?: Date;
    error?: string;
  } {
    if (!dateString || dateString.length < 10) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Data inválida" };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de data inválido" };
    }
  }

  /**
   * Valida formato de data e hora (DD/MM/AAAA HH:mm)
   */
  static validateDateTimeFormat(dateTimeString: string): {
    isValid: boolean;
    date?: Date;
    error?: string;
  } {
    if (!dateTimeString || dateTimeString.length < 16) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(dateTimeString, "dd/MM/yyyy HH:mm", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Data/hora inválida" };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de data/hora inválido" };
    }
  }

  /**
   * Valida formato de horário (HH:mm)
   */
  static validateTimeFormat(timeString: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!timeString || timeString.length < 5) {
      return { isValid: false };
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(timeString)) {
      return { isValid: false, error: "Horário inválido" };
    }

    return { isValid: true };
  }

  /**
   * Valida formato de mês/ano (MM/AAAA)
   */
  static validateMonthYearFormat(monthYearString: string): {
    isValid: boolean;
    date?: Date;
    error?: string;
  } {
    if (!monthYearString || monthYearString.length < 7) {
      return { isValid: false };
    }

    try {
      const parsedDate = parse(monthYearString, "MM/yyyy", new Date());

      if (!isValid(parsedDate)) {
        return { isValid: false, error: "Mês/ano inválido" };
      }

      const month = parseInt(monthYearString.split("/")[0]);

      if (month < 1 || month > 12) {
        return { isValid: false, error: "Mês deve estar entre 01 e 12" };
      }

      return { isValid: true, date: parsedDate };
    } catch {
      return { isValid: false, error: "Formato de mês/ano inválido" };
    }
  }

  /**
   * Valida se a data está dentro dos limites especificados
   */
  static validateDateRange(
    date: Date,
    minDate?: Date,
    maxDate?: Date
  ): { isValid: boolean; error?: string } {
    if (!isValid(date)) {
      return { isValid: false, error: "Data inválida" };
    }

    if (minDate && isBefore(date, startOfDay(minDate))) {
      return {
        isValid: false,
        error: `Data deve ser posterior a ${format(minDate, "dd/MM/yyyy")}`,
      };
    }

    if (maxDate && isAfter(date, endOfDay(maxDate))) {
      return {
        isValid: false,
        error: `Data deve ser anterior a ${format(maxDate, "dd/MM/yyyy")}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Valida se o horário está dentro dos limites especificados
   */
  static validateTimeRange(
    timeString: string,
    minTime?: string,
    maxTime?: string
  ): { isValid: boolean; error?: string } {
    const formatValidation = this.validateTimeFormat(timeString);
    if (!formatValidation.isValid) {
      return formatValidation;
    }

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
  }

  /**
   * Formata data para exibição
   */
  static formatDate(date: Date, pattern: string = "dd/MM/yyyy"): string {
    if (!date || !isValid(date)) return "";
    return format(date, pattern, { locale: ptBR });
  }

  /**
   * Formata data e hora para exibição
   */
  static formatDateTime(
    date: Date,
    pattern: string = "dd/MM/yyyy HH:mm"
  ): string {
    if (!date || !isValid(date)) return "";
    return format(date, pattern, { locale: ptBR });
  }

  /**
   * Converte string de data para objeto Date
   */
  static parseDate(
    dateString: string,
    pattern: string = "dd/MM/yyyy"
  ): Date | null {
    try {
      const parsedDate = parse(dateString, pattern, new Date());
      return isValid(parsedDate) ? parsedDate : null;
    } catch {
      return null;
    }
  }

  /**
   * Gera opções de horário com intervalo especificado
   */
  static generateTimeOptions(
    interval: number = 15,
    minTime?: string,
    maxTime?: string
  ): string[] {
    const times: string[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        if (minTime && timeString < minTime) continue;
        if (maxTime && timeString > maxTime) continue;

        times.push(timeString);
      }
    }

    return times;
  }

  /**
   * Verifica se duas datas são iguais (apenas data, ignorando hora)
   */
  static isSameDate(date1: Date, date2: Date): boolean {
    if (!isValid(date1) || !isValid(date2)) return false;
    return format(date1, "yyyy-MM-dd") === format(date2, "yyyy-MM-dd");
  }

  /**
   * Calcula diferença em dias entre duas datas
   */
  static daysBetween(startDate: Date, endDate: Date): number {
    if (!isValid(startDate) || !isValid(endDate)) return 0;
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Adiciona dias úteis a uma data (exclui fins de semana)
   */
  static addBusinessDays(date: Date, days: number): Date {
    if (!isValid(date)) return date;

    let result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
      result = addDays(result, 1);
      // Se não for fim de semana (0 = domingo, 6 = sábado)
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        addedDays++;
      }
    }

    return result;
  }

  /**
   * Verifica se a data é um dia útil
   */
  static isBusinessDay(date: Date): boolean {
    if (!isValid(date)) return false;
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Não é domingo nem sábado
  }

  /**
   * Obtém o primeiro dia do mês
   */
  static getFirstDayOfMonth(date: Date): Date {
    if (!isValid(date)) return date;
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  /**
   * Obtém o último dia do mês
   */
  static getLastDayOfMonth(date: Date): Date {
    if (!isValid(date)) return date;
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  /**
   * Formata data por extenso
   */
  static formatDateLong(date: Date): string {
    if (!date || !isValid(date)) return "";
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  /**
   * Obtém horário atual formatado
   */
  static getCurrentTime(): string {
    const now = new Date();
    return format(now, "HH:mm");
  }

  /**
   * Verifica se uma data é hoje
   */
  static isToday(date: Date): boolean {
    if (!isValid(date)) return false;
    return this.isSameDate(date, new Date());
  }

  /**
   * Verifica se uma data é ontem
   */
  static isYesterday(date: Date): boolean {
    if (!isValid(date)) return false;
    const yesterday = subDays(new Date(), 1);
    return this.isSameDate(date, yesterday);
  }

  /**
   * Verifica se uma data é amanhã
   */
  static isTomorrow(date: Date): boolean {
    if (!isValid(date)) return false;
    const tomorrow = addDays(new Date(), 1);
    return this.isSameDate(date, tomorrow);
  }
}
