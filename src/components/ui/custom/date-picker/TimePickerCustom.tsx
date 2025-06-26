"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import type { TimePickerCustomProps } from "./types";

/**
 * Componente TimePickerCustom - Seletor de hora customizado
 */
export const TimePickerCustom = React.forwardRef<
  HTMLButtonElement,
  TimePickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione a hora",
      disabled = false,
      required = false,
      className,
      value,
      onChange,
      interval = 30,
      minTime = "00:00",
      maxTime = "23:30",
      format = "24h",
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // Função para formatar hora no formato 12h ou 24h
    const formatTime = (time: string) => {
      if (format === "24h") return time;
      const [hour, minute] = time.split(":").map(Number);
      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
    };

    // Gerar slots de tempo
    const timeSlots = React.useMemo(() => {
      const slots: string[] = [];
      const [minHour, minMinute] = minTime.split(":").map(Number);
      const [maxHour, maxMinute] = maxTime.split(":").map(Number);

      for (let hour = minHour; hour <= maxHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          if (hour === minHour && minute < minMinute) continue;
          if (hour === maxHour && minute > maxMinute) break;

          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          slots.push(time);
        }
      }
      return slots;
    }, [minTime, maxTime, interval]);

    const handleSelect = (time: string) => {
      onChange?.(time);
      setOpen(false);
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
              <Clock className="mr-2 h-4 w-4" />
              {value ? formatTime(value) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[150px] p-0" align="start">
            <ScrollArea className="h-[250px]">
              <div className="p-2 space-y-1">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={value === time ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "w-full",
                      timeSlotVariants({
                        selected: value === time,
                      })
                    )}
                    onClick={() => handleSelect(time)}
                  >
                    {formatTime(time)}
                  </Button>
                ))}
              </div>
            </ScrollArea>
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

TimePickerCustom.displayName = "TimePickerCustom";
