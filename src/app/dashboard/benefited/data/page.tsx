"use client";

import React, { useState } from "react";
import {
  DatePickerCustom,
  DateTimePickerCustom,
  DateRangePickerCustom,
  TimePickerCustom,
  TimeRangePickerCustom,
  MonthYearPickerCustom,
} from "@/components/ui/custom/date-picker";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Componente demonstrativo dos componentes de data
 */
export default function DatePickerShowcase() {
  // Estados para cada componente
  const [date, setDate] = useState<Date | undefined>();
  const [dateTime, setDateTime] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({});
  const [time, setTime] = useState<string | undefined>();
  const [timeRange, setTimeRange] = useState<{
    startTime?: string;
    endTime?: string;
  }>({});
  const [monthYear, setMonthYear] = useState<Date | undefined>();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Date Picker Components</h1>
        <p className="text-muted-foreground">
          Exemplos de uso dos componentes de seleção de data e hora
        </p>
      </div>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="variations">Variações</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-6">
          {/* Date Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Date Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <DatePickerCustom
                label="Data de nascimento"
                value={date}
                onChange={setDate}
                placeholder="Selecione sua data de nascimento"
                helperText="Formato: DD/MM/AAAA"
                required
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Valor selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {date
                    ? date.toLocaleDateString("pt-BR")
                    : "Nenhuma data selecionada"}
                </p>
              </div>
            </div>
          </Card>

          {/* DateTime Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">DateTime Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <DateTimePickerCustom
                label="Data e hora do evento"
                value={dateTime}
                onChange={setDateTime}
                placeholder="Selecione data e hora"
                helperText="Selecione uma data e depois o horário"
                timeInterval={15}
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Valor selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {dateTime
                    ? dateTime.toLocaleString("pt-BR")
                    : "Nenhuma data/hora selecionada"}
                </p>
              </div>
            </div>
          </Card>

          {/* Date Range Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Date Range Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <DateRangePickerCustom
                label="Período de férias"
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={setDateRange}
                placeholder="Selecione o período"
                helperText="Selecione a data inicial e final"
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Período selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {dateRange.startDate && dateRange.endDate
                    ? `${dateRange.startDate.toLocaleDateString(
                        "pt-BR"
                      )} até ${dateRange.endDate.toLocaleDateString("pt-BR")}`
                    : "Nenhum período selecionado"}
                </p>
              </div>
            </div>
          </Card>

          {/* Time Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Time Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <TimePickerCustom
                label="Horário de início"
                value={time}
                onChange={setTime}
                placeholder="Selecione o horário"
                helperText="Intervalos de 30 minutos"
                interval={30}
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Horário selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {time || "Nenhum horário selecionado"}
                </p>
              </div>
            </div>
          </Card>

          {/* Time Range Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Time Range Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <TimeRangePickerCustom
                label="Horário de funcionamento"
                startTime={timeRange.startTime}
                endTime={timeRange.endTime}
                onChange={setTimeRange}
                placeholder="Selecione o período"
                helperText="Horário de abertura e fechamento"
                interval={30}
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Período selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {timeRange.startTime && timeRange.endTime
                    ? `${timeRange.startTime} até ${timeRange.endTime}`
                    : "Nenhum período selecionado"}
                </p>
              </div>
            </div>
          </Card>

          {/* Month Year Picker */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Month Year Picker</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <MonthYearPickerCustom
                label="Mês/Ano de referência"
                value={monthYear}
                onChange={setMonthYear}
                placeholder="Selecione mês e ano"
                helperText="Apenas mês e ano"
                minYear={2020}
                maxYear={2030}
              />
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Valor selecionado:</p>
                <p className="text-sm text-muted-foreground">
                  {monthYear
                    ? monthYear.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Nenhum mês/ano selecionado"}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="variations" className="space-y-6">
          {/* Variações com erro */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Estados de Erro</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <DatePickerCustom
                label="Com erro"
                error="Data inválida"
                required
              />
              <DateTimePickerCustom
                label="Com erro"
                error="Data e hora obrigatórias"
                required
              />
              <TimePickerCustom
                label="Com erro"
                error="Horário fora do permitido"
              />
            </div>
          </Card>

          {/* Variações desabilitadas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Estados Desabilitados
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <DatePickerCustom
                label="Desabilitado"
                disabled
                value={new Date()}
              />
              <DateRangePickerCustom
                label="Desabilitado"
                disabled
                startDate={new Date()}
                endDate={new Date()}
              />
              <MonthYearPickerCustom
                label="Desabilitado"
                disabled
                value={new Date()}
              />
            </div>
          </Card>

          {/* Variações com diferentes configurações */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Configurações Especiais
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <DateTimePickerCustom
                label="Intervalos de 5 minutos"
                timeInterval={5}
                minTime="08:00"
                maxTime="18:00"
              />
              <TimePickerCustom
                label="Apenas horário comercial"
                interval={60}
                minTime="09:00"
                maxTime="17:00"
              />
              <MonthYearPickerCustom
                label="Anos limitados"
                minYear={2023}
                maxYear={2025}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
