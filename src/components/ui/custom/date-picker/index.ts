/**
 * Exportações principais dos Date Picker Components
 * Estrutura organizada para evitar conflitos de tipos
 */

// ============================================================================
// COMPONENTES PRINCIPAIS
// ============================================================================

export { DatePickerCustom } from "./DatePickerCustom";
export { DateTimePickerCustom } from "./DateTimePickerCustom";
export { DateRangePickerCustom } from "./DateRangePickerCustom";
export { TimePickerCustom } from "./TimePickerCustom";
export { TimeRangePickerCustom } from "./TimeRangePickerCustom";
export { MonthYearPickerCustom } from "./MonthYearPickerCustom";

// ============================================================================
// TIPOS PRINCIPAIS
// ============================================================================

// Tipos básicos
export type {
  DatePickerSize,
  DateFormat,
  TimeFormat,
  TimeInterval,
  ValidationResult,
  DateValidationResult,
  DateRange,
  TimeRange,
} from "./types/essential";

// Props dos componentes
export type {
  DatePickerCustomProps,
  DateTimePickerCustomProps,
  DateRangePickerCustomProps,
  TimePickerCustomProps,
  TimeRangePickerCustomProps,
  MonthYearPickerCustomProps,
} from "./types";

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================

export { useDatePicker, useDateRange } from "./hooks/useDatePicker";

// ============================================================================
// UTILITÁRIOS
// ============================================================================

export { DateUtils } from "./utils/dateUtils";

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================

export {
  DEFAULT_CONFIG,
  DEFAULT_PLACEHOLDERS,
  DEFAULT_ERROR_MESSAGES,
  TIME_INTERVALS,
  SIZES,
  DATE_FORMATS,
  TIME_FORMATS,
  VALIDATION_PATTERNS,
} from "./config/constants";
