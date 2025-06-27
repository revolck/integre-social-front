/**
 * Tipos essenciais para evitar conflitos de importação
 */

// ============================================================================
// TIPOS BÁSICOS - SEM IMPORTAÇÕES EXTERNAS
// ============================================================================

/** Tamanhos disponíveis para os componentes */
export type DatePickerSize = "sm" | "md" | "lg";

/** Formatos de data suportados */
export type DateFormat =
  | "dd/MM/yyyy"
  | "MM/dd/yyyy"
  | "yyyy-MM-dd"
  | "dd-MM-yyyy";

/** Formatos de horário suportados */
export type TimeFormat = "HH:mm" | "hh:mm a" | "HH:mm:ss";

/** Intervalos de tempo disponíveis */
export type TimeInterval = 5 | 10 | 15 | 30 | 60;

/** Estado de validação */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/** Resultado de validação com data */
export interface DateValidationResult extends ValidationResult {
  date?: Date;
}

/** Interface para range de datas */
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

/** Interface para range de horários */
export interface TimeRange {
  startTime?: string;
  endTime?: string;
}

// ============================================================================
// PROPS BASE - SEM DEPENDÊNCIAS EXTERNAS
// ============================================================================

/** Props base compartilhadas por todos os date pickers */
export interface BaseDatePickerProps {
  label: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  size?: DatePickerSize;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  "data-testid"?: string;
}

// ============================================================================
// UTILITÁRIOS PARA MÁSCARAS
// ============================================================================

/** Interface para utilitários de máscara */
export interface MaskUtils {
  apply: (value: string) => string;
  remove: (value: string) => string;
  validate: (value: string) => ValidationResult;
}

/** Estados internos dos componentes */
export interface DatePickerState {
  isOpen: boolean;
  inputValue: string;
  internalError?: string;
  isFocused: boolean;
}
