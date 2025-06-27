// src/app/dashboard/benefited/data/page.tsx
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Info, CheckCircle } from "lucide-react";

/**
 * Componente demonstrativo dos componentes de data editáveis
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
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Date Picker Components</h1>
          <Badge variant="secondary" className="ml-auto">
            v2.0 - Editável
          </Badge>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Todos os componentes agora permitem{" "}
            <strong>digitação direta</strong> no input com máscaras automáticas,
            além de seleção visual através do popup. Experimente digitar datas e
            horários!
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="examples">Exemplos Básicos</TabsTrigger>
          <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
          <TabsTrigger value="forms">Integração com Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-6">
          {/* Date Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <DatePickerCustom
                    label="Data de nascimento"
                    value={date}
                    onChange={setDate}
                    placeholder="DD/MM/AAAA"
                    helperText="Digite no formato DD/MM/AAAA ou use o calendário"
                    required
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Como usar:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Digite diretamente: ex. 15031990</li>
                      <li>Clique no ícone para abrir o calendário</li>
                      <li>Validação automática enquanto digita</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Valor:</strong>{" "}
                      {date ? date.toLocaleDateString("pt-BR") : "Nenhuma data"}
                    </p>
                    <p className="text-sm">
                      <strong>ISO:</strong>{" "}
                      {date ? date.toISOString().split("T")[0] : "null"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DateTime Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                DateTime Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <DateTimePickerCustom
                    label="Data e hora do evento"
                    value={dateTime}
                    onChange={setDateTime}
                    placeholder="DD/MM/AAAA HH:mm"
                    helperText="Digite data e hora ou use os seletores"
                    timeInterval={15}
                    minTime="08:00"
                    maxTime="22:00"
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Características:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Intervalos de 15 minutos</li>
                      <li>Horário limitado: 08:00 - 22:00</li>
                      <li>Digite: ex. 25122024 1430</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Completo:</strong>{" "}
                      {dateTime
                        ? dateTime.toLocaleString("pt-BR")
                        : "Nenhuma data/hora"}
                    </p>
                    <p className="text-sm">
                      <strong>ISO:</strong>{" "}
                      {dateTime ? dateTime.toISOString() : "null"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Range Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Date Range Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <DateRangePickerCustom
                    label="Período de férias"
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={setDateRange}
                    placeholder="DD/MM/AAAA - DD/MM/AAAA"
                    helperText="Digite as duas datas ou selecione no calendário"
                    minDate={new Date()}
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Funcionalidades:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Aceita apenas datas futuras</li>
                      <li>Digite: ex. 01012025 - 15012025</li>
                      <li>Validação de sequência automática</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Início:</strong>{" "}
                      {dateRange.startDate
                        ? dateRange.startDate.toLocaleDateString("pt-BR")
                        : "Não definido"}
                    </p>
                    <p className="text-sm">
                      <strong>Fim:</strong>{" "}
                      {dateRange.endDate
                        ? dateRange.endDate.toLocaleDateString("pt-BR")
                        : "Não definido"}
                    </p>
                    <p className="text-sm">
                      <strong>Duração:</strong>{" "}
                      {dateRange.startDate && dateRange.endDate
                        ? `${Math.ceil(
                            (dateRange.endDate.getTime() -
                              dateRange.startDate.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )} dias`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <TimePickerCustom
                    label="Horário de início"
                    value={time}
                    onChange={setTime}
                    placeholder="HH:mm"
                    helperText="Digite horário ou selecione da lista"
                    interval={30}
                    minTime="06:00"
                    maxTime="23:30"
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Configurações:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Intervalos de 30 minutos</li>
                      <li>Horário: 06:00 - 23:30</li>
                      <li>Digite: ex. 1430 ou 14:30</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Horário:</strong> {time || "Nenhum horário"}
                    </p>
                    <p className="text-sm">
                      <strong>Formato 24h:</strong>{" "}
                      {time ? `${time}:00` : "null"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Range Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Range Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <TimeRangePickerCustom
                    label="Horário de funcionamento"
                    startTime={timeRange.startTime}
                    endTime={timeRange.endTime}
                    onChange={setTimeRange}
                    placeholder="HH:mm - HH:mm"
                    helperText="Defina o período de funcionamento"
                    interval={60}
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Características:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Intervalos de 1 hora</li>
                      <li>Digite: ex. 0800 - 1800</li>
                      <li>Validação de período automática</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Abertura:</strong>{" "}
                      {timeRange.startTime || "Não definido"}
                    </p>
                    <p className="text-sm">
                      <strong>Fechamento:</strong>{" "}
                      {timeRange.endTime || "Não definido"}
                    </p>
                    <p className="text-sm">
                      <strong>Duração:</strong>{" "}
                      {timeRange.startTime && timeRange.endTime
                        ? (() => {
                            const start = timeRange.startTime
                              .split(":")
                              .map(Number);
                            const end = timeRange.endTime
                              .split(":")
                              .map(Number);
                            const startMinutes = start[0] * 60 + start[1];
                            const endMinutes = end[0] * 60 + end[1];
                            const diffHours = (endMinutes - startMinutes) / 60;
                            return `${diffHours}h`;
                          })()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Month Year Picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Month Year Picker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <MonthYearPickerCustom
                    label="Mês/Ano de referência"
                    value={monthYear}
                    onChange={setMonthYear}
                    placeholder="MM/AAAA"
                    helperText="Para relatórios mensais"
                    minYear={2020}
                    maxYear={2030}
                  />

                  <div className="text-sm text-gray-600">
                    <strong>Limitações:</strong>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>Anos: 2020 - 2030</li>
                      <li>Digite: ex. 122024</li>
                      <li>Interface intuitiva de navegação</li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Resultado:
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <strong>Período:</strong>{" "}
                      {monthYear
                        ? monthYear.toLocaleDateString("pt-BR", {
                            month: "long",
                            year: "numeric",
                          })
                        : "Nenhum período"}
                    </p>
                    <p className="text-sm">
                      <strong>Formato curto:</strong>{" "}
                      {monthYear
                        ? monthYear.toLocaleDateString("pt-BR", {
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "null"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Estados de Erro */}
          <Card>
            <CardHeader>
              <CardTitle>Estados de Erro e Validação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DatePickerCustom
                  label="Com erro personalizado"
                  error="Esta data é obrigatória"
                  required
                />
                <DateTimePickerCustom
                  label="Data/hora inválida"
                  error="Horário fora do permitido"
                  value={new Date("invalid")}
                />
                <TimePickerCustom
                  label="Horário com limite"
                  error="Deve estar entre 09:00 e 17:00"
                  minTime="09:00"
                  maxTime="17:00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Estados Desabilitados */}
          <Card>
            <CardHeader>
              <CardTitle>Estados Desabilitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DatePickerCustom
                  label="Campo desabilitado"
                  disabled
                  value={new Date()}
                  helperText="Este campo não pode ser editado"
                />
                <DateRangePickerCustom
                  label="Período fixo"
                  disabled
                  startDate={new Date()}
                  endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                />
                <MonthYearPickerCustom
                  label="Mês bloqueado"
                  disabled
                  value={new Date()}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diferentes Tamanhos */}
          <Card>
            <CardHeader>
              <CardTitle>Variações de Tamanho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <DatePickerCustom
                    label="Tamanho pequeno"
                    size="sm"
                    placeholder="DD/MM/AAAA"
                  />
                  <DatePickerCustom
                    label="Tamanho médio (padrão)"
                    size="md"
                    placeholder="DD/MM/AAAA"
                  />
                  <DatePickerCustom
                    label="Tamanho grande"
                    size="lg"
                    placeholder="DD/MM/AAAA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Especiais */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    DateTime com intervalos de 5 min
                  </h4>
                  <DateTimePickerCustom
                    label="Compromisso detalhado"
                    timeInterval={5}
                    minTime="08:00"
                    maxTime="18:00"
                    helperText="Intervalos de 5 minutos para máxima precisão"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Date Range apenas dias úteis</h4>
                  <DateRangePickerCustom
                    label="Período de trabalho"
                    minDate={new Date()}
                    helperText="Apenas datas futuras permitidas"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Integração com React Hook Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Todos os componentes são totalmente compatíveis com React Hook
                  Form, Formik e outras bibliotecas de formulário. Eles seguem o
                  padrão <code>value/onChange</code> standard do React.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h4 className="font-medium">
                  Exemplo de uso com React Hook Form:
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  {`import { useForm, Controller } from "react-hook-form";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";

function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="birthDate"
        control={control}
        rules={{ required: "Data de nascimento é obrigatória" }}
        render={({ field: { value, onChange } }) => (
          <DatePickerCustom
            label="Data de Nascimento"
            value={value}
            onChange={onChange}
            error={errors.birthDate?.message}
            required
          />
        )}
      />
    </form>
  );
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
