"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  datePickerContainerVariants,
  datePickerTriggerVariants,
  timeSlotVariants,
} from "./variants";
import type { DateTimePickerCustomProps } from "./types";

/**
 * Componente DateTimePickerCustom - Seletor de data e hora customizado
 */
export const DateTimePickerCustom = React.forwardRef<
  HTMLButtonElement,
  DateTimePickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione data e hora",
      disabled = false,
      required = false,
      className,
      dateFormat = "dd/MM/yyyy HH:mm",
      locale = ptBR,
      value,
      onChange,
      timeInterval = 30,
      minTime = "00:00",
      maxTime = "23:30",
      timeFormat = "24h", // Mantido, mas não utilizado
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
      value
    );
    const [selectedTime, setSelectedTime] = React.useState<string | undefined>(
      value ? format(value, "HH:mm") : undefined
    );

    // Gerar slots de tempo
    const timeSlots = React.useMemo(() => {
      const slots: string[] = [];
      const [minHour, minMinute] = minTime.split(":").map(Number);
      const [maxHour, maxMinute] = maxTime.split(":").map(Number);

      for (let hour = minHour; hour <= maxHour; hour++) {
        for (let minute = 0; minute < 60; minute += timeInterval) {
          if (hour === minHour && minute < minMinute) continue;
          if (hour === maxHour && minute > maxMinute) break;

          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          slots.push(time);
        }
      }
      return slots;
    }, [minTime, maxTime, timeInterval]);

    const handleDateSelect = (date: Date | undefined) => {
      setSelectedDate(date);
      if (date && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes);
        onChange?.(newDate);
      }
    };

    const handleTimeSelect = (time: string) => {
      setSelectedTime(time);
      if (selectedDate) {
        const [hours, minutes] = time.split(":").map(Number);
        const newDate = new Date(selectedDate);
        newDate.setHours(hours, minutes);
        onChange?.(newDate);
        setOpen(false);
      }
    };

    const containerClasses = cn(
      datePickerContainerVariants({
        hasError: !!error,
        disabled,
      }),
      className
    );

    const triggerClasses = cn(
      datePickerTriggerVariants({
        hasValue: !!value,
        hasError: !!error,
      })
    );

    return (
      <div className={containerClasses}>
        {label && (
          <Label className="mb-2 block">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </Label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              className={triggerClasses}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, dateFormat, { locale }) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
                locale={locale}
                className="p-3"
              />
              <div className="flex flex-col p-3 border-l">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Horário</span>
                </div>
                <ScrollArea className="h-[250px] w-[120px]">
                  <div className="space-y-1">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full",
                          timeSlotVariants({
                            selected: selectedTime === time,
                          })
                        )}
                        onClick={() => handleTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

        {!error && helperText && (
          <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

DateTimePickerCustom.displayName = "DateTimePickerCustom";
