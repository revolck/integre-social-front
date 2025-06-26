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
import type { TimeRangePickerCustomProps } from "./types";

/**
 * Componente TimeRangePickerCustom - Seletor de intervalo de hora customizado
 */
export const TimeRangePickerCustom = React.forwardRef<
  HTMLButtonElement,
  TimeRangePickerCustomProps
>(
  (
    {
      label,
      error,
      helperText,
      placeholder = "Selecione o período",
      disabled = false,
      required = false,
      className,
      startTime,
      endTime,
      onChange,
      interval = 30,
      // format = "24h", // Comentado para evitar aviso ts(6133), descomente se for implementar formatação
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectingEnd, setSelectingEnd] = React.useState(false);

    // Gerar slots de tempo
    const timeSlots = React.useMemo(() => {
      const slots: string[] = [];

      for (let hour = 0; hour <= 23; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          slots.push(time);
        }
      }
      return slots;
    }, [interval]);

    const handleStartSelect = (time: string) => {
      onChange?.({ startTime: time, endTime });
      setSelectingEnd(true);
    };

    const handleEndSelect = (time: string) => {
      onChange?.({ startTime, endTime: time });
      setOpen(false);
      setSelectingEnd(false);
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
        hasValue: !!startTime || !!endTime,
        hasError: !!error,
      })
    );

    const displayValue = React.useMemo(() => {
      if (startTime && endTime) {
        return `${startTime} - ${endTime}`;
      }
      if (startTime) {
        return `${startTime} - ...`;
      }
      return placeholder;
    }, [startTime, endTime, placeholder]);

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
              {displayValue}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="start">
            <div className="flex">
              <div className="flex-1 border-r">
                <div className="p-3 text-center text-sm font-medium">
                  {selectingEnd ? "✓" : ""} Início
                </div>
                <ScrollArea className="h-[250px]">
                  <div className="p-2 space-y-1">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={startTime === time ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full",
                          timeSlotVariants({
                            selected: startTime === time,
                          })
                        )}
                        onClick={() => handleStartSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex-1">
                <div className="p-3 text-center text-sm font-medium">Fim</div>
                <ScrollArea className="h-[250px]">
                  <div className="p-2 space-y-1">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={endTime === time ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "w-full",
                          timeSlotVariants({
                            selected: endTime === time,
                            available: !startTime || time > startTime,
                          })
                        )}
                        onClick={() => handleEndSelect(time)}
                        disabled={!startTime || time <= startTime}
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

TimeRangePickerCustom.displayName = "TimeRangePickerCustom";
