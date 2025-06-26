import { Locale } from "date-fns";
import { DayPicker } from "react-day-picker";

/**
 * Props base para todos os componentes de data
 */
export interface DatePickerBaseProps {
  /**
   * Rótulo do campo
   */
  label?: string;

  /**
   * Mensagem de erro
   */
  error?: string;

  /**
   * Texto de ajuda
   */
  helperText?: string;

  /**
   * Placeholder do campo
   */
  placeholder?: string;

  /**
   * Se o campo está desabilitado
   */
  disabled?: boolean;

  /**
   * Se o campo é obrigatório
   */
  required?: boolean;

  /**
   * Classes CSS adicionais
   */
  className?: string;

  /**
   * Formato da data
   */
  dateFormat?: string;

  /**
   * Locale para formatação
   */
  locale?: Locale;
}

/**
 * Props para o DatePickerCustom
 */
export interface DatePickerCustomProps extends DatePickerBaseProps {
  /**
   * Data selecionada
   */
  value?: Date;

  /**
   * Callback quando a data muda
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Propriedades do calendário
   */
  calendarProps?: React.ComponentProps<typeof DayPicker>;

  /**
   * Propriedades do botão
   */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * Props para o DateTimePickerCustom
 */
export interface DateTimePickerCustomProps extends DatePickerBaseProps {
  /**
   * Data e hora selecionada
   */
  value?: Date;

  /**
   * Callback quando a data e hora mudam
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Intervalo de tempo em minutos
   */
  timeInterval?: number;

  /**
   * Hora mínima
   */
  minTime?: string;

  /**
   * Hora máxima
   */
  maxTime?: string;

  /**
   * Formato da hora
   */
  timeFormat?: "12h" | "24h";
}

/**
 * Props para o DateRangePickerCustom
 */
export interface DateRangePickerCustomProps extends DatePickerBaseProps {
  /**
   * Data inicial
   */
  startDate?: Date;

  /**
   * Data final
   */
  endDate?: Date;

  /**
   * Callback quando as datas mudam
   */
  onChange?: (dates: { startDate?: Date; endDate?: Date }) => void;

  /**
   * Número máximo de dias no intervalo
   */
  maxDays?: number;

  /**
   * Número mínimo de dias no intervalo
   */
  minDays?: number;
}

/**
 * Props para o TimePickerCustom
 */
export interface TimePickerCustomProps
  extends Omit<DatePickerBaseProps, "dateFormat"> {
  /**
   * Hora selecionada
   */
  value?: string;

  /**
   * Callback quando a hora muda
   */
  onChange?: (time: string | undefined) => void;

  /**
   * Intervalo de tempo em minutos
   */
  interval?: number;

  /**
   * Hora mínima
   */
  minTime?: string;

  /**
   * Hora máxima
   */
  maxTime?: string;

  /**
   * Formato da hora
   */
  format?: "12h" | "24h";
}

/**
 * Props para o TimeRangePickerCustom
 */
export interface TimeRangePickerCustomProps
  extends Omit<DatePickerBaseProps, "dateFormat"> {
  /**
   * Hora inicial
   */
  startTime?: string;

  /**
   * Hora final
   */
  endTime?: string;

  /**
   * Callback quando as horas mudam
   */
  onChange?: (times: { startTime?: string; endTime?: string }) => void;

  /**
   * Intervalo de tempo em minutos
   */
  interval?: number;

  /**
   * Formato da hora
   */
  format?: "12h" | "24h";
}

/**
 * Props para o MonthYearPickerCustom
 */
export interface MonthYearPickerCustomProps extends DatePickerBaseProps {
  /**
   * Mês e ano selecionados
   */
  value?: Date;

  /**
   * Callback quando o mês/ano muda
   */
  onChange?: (date: Date | undefined) => void;

  /**
   * Ano mínimo
   */
  minYear?: number;

  /**
   * Ano máximo
   */
  maxYear?: number;
}
