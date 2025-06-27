/**
 * Tipos e interfaces para os componentes de Date Picker
 */

// Importar tipos essenciais
import type {
  DatePickerSize,
  DateFormat,
  TimeFormat,
  TimeInterval,
  ValidationResult,
  DateValidationResult,
  DateRange,
  TimeRange,
  BaseDatePickerProps,
  MaskUtils,
  DatePickerState,
} from "./essential";

// Re-exportar tipos essenciais
export type {
  DatePickerSize,
  DateFormat,
  TimeFormat,
  TimeInterval,
  ValidationResult,
  DateValidationResult,
  DateRange,
  TimeRange,
  BaseDatePickerProps,
  MaskUtils,
  DatePickerState,
};

// ============================================================================
// PROPS ESPECÍFICAS DOS COMPONENTES
// ============================================================================

/** Props específicas para DatePickerCustom */
export interface DatePickerCustomProps extends BaseDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  dateFormat?: DateFormat;
  onValidate?: (date: Date | undefined) => string | undefined;
  onFocusChange?: (isFocused: boolean) => void;
}

/** Props específicas para DateTimePickerCustom */
export interface DateTimePickerCustomProps extends BaseDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  minTime?: string;
  maxTime?: string;
  timeInterval?: TimeInterval;
  dateFormat?: DateFormat;
  timeFormat?: TimeFormat;
  onValidate?: (date: Date | undefined) => string | undefined;
}

/** Props específicas para DateRangePickerCustom */
export interface DateRangePickerCustomProps extends BaseDatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (range: DateRange) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  maxDuration?: number;
  minDuration?: number;
  dateFormat?: DateFormat;
  onValidate?: (range: DateRange) => string | undefined;
  numberOfMonths?: 1 | 2;
}

/** Props específicas para TimePickerCustom */
export interface TimePickerCustomProps extends BaseDatePickerProps {
  value?: string;
  onChange?: (time: string | undefined) => void;
  placeholder?: string;
  minTime?: string;
  maxTime?: string;
  interval?: TimeInterval;
  timeFormat?: TimeFormat;
  onValidate?: (time: string | undefined) => string | undefined;
  includeSeconds?: boolean;
}

/** Props específicas para TimeRangePickerCustom */
export interface TimeRangePickerCustomProps extends BaseDatePickerProps {
  startTime?: string;
  endTime?: string;
  onChange?: (range: TimeRange) => void;
  placeholder?: string;
  minTime?: string;
  maxTime?: string;
  interval?: TimeInterval;
  maxDuration?: number;
  minDuration?: number;
  timeFormat?: TimeFormat;
  onValidate?: (range: TimeRange) => string | undefined;
}

/** Props específicas para MonthYearPickerCustom */
export interface MonthYearPickerCustomProps extends BaseDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minYear?: number;
  maxYear?: number;
  onValidate?: (date: Date | undefined) => string | undefined;
}
