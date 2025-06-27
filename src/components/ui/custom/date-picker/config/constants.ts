/**
 * Constantes e configurações padrão para os Date Pickers
 */

import { ptBR } from "date-fns/locale";
import type {
  DateFormat,
  TimeFormat,
  TimeInterval,
  DatePickerSize,
} from "../types/essential";

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

/** Configurações padrão dos componentes */
export const DEFAULT_CONFIG = {
  dateFormat: "dd/MM/yyyy" as DateFormat,
  timeFormat: "HH:mm" as TimeFormat,
  timeInterval: 15 as TimeInterval,
  size: "md" as DatePickerSize,
  locale: ptBR,
  fullWidth: true,
  required: false,
  disabled: false,
} as const;

/** Placeholders padrão */
export const DEFAULT_PLACEHOLDERS = {
  date: "DD/MM/AAAA",
  dateTime: "DD/MM/AAAA HH:mm",
  dateRange: "DD/MM/AAAA - DD/MM/AAAA",
  time: "HH:mm",
  timeRange: "HH:mm - HH:mm",
  monthYear: "MM/AAAA",
} as const;

/** Mensagens de erro padrão */
export const DEFAULT_ERROR_MESSAGES = {
  required: "Este campo é obrigatório",
  invalidDate: "Data inválida",
  invalidTime: "Horário inválido",
  invalidDateTime: "Data/hora inválida",
  invalidRange: "Período inválido",
  dateBeforeMin: "Data deve ser posterior a",
  dateAfterMax: "Data deve ser anterior a",
  timeBeforeMin: "Horário deve ser posterior a",
  timeAfterMax: "Horário deve ser anterior a",
  startAfterEnd: "Data inicial deve ser anterior à data final",
  timeStartAfterEnd: "Horário inicial deve ser anterior ao horário final",
  maxDurationExceeded: "Período não pode exceder",
  minAge: "Idade mínima não atingida",
} as const;

// ============================================================================
// INTERVALOS DE TEMPO
// ============================================================================

/** Intervalos de tempo disponíveis */
export const TIME_INTERVALS = [5, 10, 15, 30, 60] as const;

/** Tamanhos disponíveis */
export const SIZES = ["sm", "md", "lg"] as const;

/** Formatos de data disponíveis */
export const DATE_FORMATS = [
  "dd/MM/yyyy",
  "MM/dd/yyyy",
  "yyyy-MM-dd",
  "dd-MM-yyyy",
] as const;

/** Formatos de hora disponíveis */
export const TIME_FORMATS = ["HH:mm", "hh:mm a", "HH:mm:ss"] as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

/** Padrões regex para validação */
export const VALIDATION_PATTERNS = {
  date: /^\d{2}\/\d{2}\/\d{4}$/,
  time: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  monthYear: /^\d{2}\/\d{4}$/,
  dateTime: /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/,
  dateRange: /^\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}$/,
  timeRange: /^\d{2}:\d{2} - \d{2}:\d{2}$/,
} as const;
