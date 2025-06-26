"use client";

import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InputCustom } from "@/components/ui/custom/input";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";

// Schema de validação atualizado
const beneficiaryFormSchema = z.object({
  // Dados básicos
  serviceDate: z.string().min(1, "Data do atendimento é obrigatória"),
  cpf: z
    .string()
    .min(11, "CPF é obrigatório")
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  nisNumber: z.string().optional(),

  // Dados pessoais
  cns: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  rg: z.string().optional(),
  rgIssueDate: z.string().optional(),
  rgIssuer: z.string().optional(),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  race: z.string().min(1, "Cor é obrigatória"),
  sex: z.string().min(1, "Sexo é obrigatório"),
  genderIdentity: z.string().min(1, "Identidade de gênero é obrigatória"),
  maritalStatus: z.string().min(1, "Estado civil é obrigatório"),
  education: z.string().optional(),
  religion: z.string().optional(),
  incomeSource: z.string().optional(),
  individualIncome: z.string().optional(),
  fatherName: z.string().min(1, "Nome do pai é obrigatório"),
  motherName: z.string().min(1, "Nome da mãe é obrigatório"),

  // Endereço
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(1, "Telefone é obrigatório"),
  zipCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  complement: z.string().optional(),
  referencePoint: z.string().optional(),
  originCharacteristics: z.string().optional(),

  // Naturalidade/nacionalidade
  birthCity: z.string().min(1, "Cidade é obrigatória"),
  nationality: z.string().optional(),
  isMigrant: z.boolean().default(false),

  // Título de eleitor
  voterTitle: z.string().optional(),
  voterZone: z.string().optional(),
  voterSection: z.string().optional(),
  votingLocation: z.string().optional(),

  // Necessidades especiais
  hasDisability: z.string().optional(),
  disabilityTypes: z.array(z.string()).optional(),
  disabilityObservations: z.string().optional(),
});

type BeneficiaryFormData = z.infer<typeof beneficiaryFormSchema>;

// Constantes para as opções de select
const RACE_OPTIONS = [
  { value: "branca", label: "Branca" },
  { value: "preta", label: "Preta" },
  { value: "parda", label: "Parda" },
  { value: "amarela", label: "Amarela" },
  { value: "indigena", label: "Indígena" },
];

const SEX_OPTIONS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
];

const GENDER_IDENTITY_OPTIONS = [
  { value: "cisgenero", label: "Cisgênero" },
  { value: "transgenero", label: "Transgênero" },
  { value: "nao-binario", label: "Não-binário" },
  { value: "genero-fluido", label: "Gênero fluido" },
  { value: "agenero", label: "Agênero" },
  { value: "outro", label: "Outro" },
  { value: "nao-informar", label: "Prefiro não informar" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "uniao-estavel", label: "União estável" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "separado", label: "Separado(a)" },
];

const EDUCATION_OPTIONS = [
  { value: "sem-escolaridade", label: "Sem escolaridade" },
  { value: "fundamental-incompleto", label: "Fundamental incompleto" },
  { value: "fundamental-completo", label: "Fundamental completo" },
  { value: "medio-incompleto", label: "Médio incompleto" },
  { value: "medio-completo", label: "Médio completo" },
  { value: "superior-incompleto", label: "Superior incompleto" },
  { value: "superior-completo", label: "Superior completo" },
  { value: "pos-graduacao", label: "Pós-graduação" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
];

const RELIGION_OPTIONS = [
  { value: "catolica", label: "Católica" },
  { value: "evangelica", label: "Evangélica" },
  { value: "espirita", label: "Espírita" },
  { value: "umbanda", label: "Umbanda" },
  { value: "candomble", label: "Candomblé" },
  { value: "judaica", label: "Judaica" },
  { value: "islamica", label: "Islâmica" },
  { value: "budista", label: "Budista" },
  { value: "hinduista", label: "Hinduísta" },
  { value: "ateu-agnostico", label: "Ateu/Agnóstico" },
  { value: "outras", label: "Outras" },
  { value: "sem-religiao", label: "Sem religião" },
];

const DISABILITY_OPTIONS = [
  { value: "fisica", label: "Física" },
  { value: "mental", label: "Mental" },
  { value: "intelectual", label: "Intelectual" },
  { value: "auditiva", label: "Auditiva" },
  { value: "visual", label: "Visual" },
];

export default function BeneficiaryRegisterPage() {
  const [photoPreview, setPhotoPreview] = useState<string>("/avatar.svg");
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>(
    []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Inicializar formulário
  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiaryFormSchema),
    defaultValues: {
      serviceDate: new Date().toISOString().split("T")[0],
      isMigrant: false,
      disabilityTypes: [],
    },
  });

  // Função para lidar com upload de foto
  const handlePhotoUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validar tamanho e tipo
        if (file.size > 5 * 1024 * 1024) {
          toastCustom.error("Arquivo muito grande. Máximo 5MB.");
          return;
        }

        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
          toastCustom.error("Tipo de arquivo inválido. Use JPG, JPEG ou PNG.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotoPreview(e.target?.result as string);
          toastCustom.success("Foto carregada com sucesso!");
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Função para iniciar webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toastCustom.error("Erro ao acessar a câmera");
    }
  }, []);

  // Função para capturar foto da webcam
  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/png");
        setPhotoPreview(dataUrl);
        stopCamera();
        toastCustom.success("Foto capturada com sucesso!");
      }
    }
  }, []);

  // Função para parar a câmera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  }, []);

  // Função para lidar com mudanças nas deficiências
  const handleDisabilityChange = (disability: string, checked: boolean) => {
    if (checked) {
      setSelectedDisabilities((prev) => [...prev, disability]);
    } else {
      setSelectedDisabilities((prev) => prev.filter((d) => d !== disability));
    }
  };

  // Função de submit
  const onSubmit = async (data: BeneficiaryFormData) => {
    try {
      // Aqui você faria a chamada para a API
      console.log("Dados do beneficiário:", {
        ...data,
        disabilityTypes: selectedDisabilities,
      });
      toastCustom.success("Beneficiário cadastrado com sucesso!");
    } catch (error) {
      toastCustom.error("Erro ao cadastrar beneficiário");
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cadastro de Beneficiário</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais - Organização Apple-like */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={20} />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Foto centralizada no topo */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32 border-4 border-gray-100 shadow-sm">
                  <AvatarImage src={photoPreview} alt="Foto do beneficiário" />
                  <AvatarFallback className="text-3xl bg-gray-50">
                    <Icon name="User" size={48} />
                  </AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="Upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload
                  </ButtonCustom>
                  <ButtonCustom
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="Camera"
                    onClick={startCamera}
                  >
                    Câmera
                  </ButtonCustom>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG, JPEG • Máx. 5MB
                </p>
              </div>

              {/* Dados básicos em grid organizado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="serviceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom
                          label="Data do Atendimento *"
                          type="date"
                          max={new Date().toISOString().split("T")[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="CPF *" mask="cpf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom
                          label="N° NIS"
                          mask="numeric"
                          maxLength={11}
                          placeholder="12345678901"
                          helperText="11 dígitos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Webcam Modal */}
              {showCamera && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
                  <div className="bg-white rounded-lg p-6 space-y-4 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold text-center">
                      Capturar Foto
                    </h3>
                    <video
                      ref={videoRef}
                      autoPlay
                      className="w-full rounded-lg"
                    />
                    <div className="flex justify-center gap-3">
                      <ButtonCustom
                        type="button"
                        onClick={capturePhoto}
                        icon="Camera"
                      >
                        Capturar
                      </ButtonCustom>
                      <ButtonCustom
                        type="button"
                        variant="outline"
                        onClick={stopCamera}
                      >
                        Cancelar
                      </ButtonCustom>
                    </div>
                  </div>
                </div>
              )}

              <canvas ref={canvasRef} className="hidden" />

              {/* Restante dos dados pessoais organizados */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="cns"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="CNS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Nome *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Nome Social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="RG" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rgIssueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom
                            label="Data de Emissão"
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rgIssuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Órgão Emissor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom
                            label="Data de Nascimento *"
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a cor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RACE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SEX_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genderIdentity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identidade de Gênero *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a identidade de gênero" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_IDENTITY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado civil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MARITAL_STATUS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escolaridade</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a escolaridade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EDUCATION_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religião</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a religião" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELIGION_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="incomeSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Fonte de Renda" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="individualIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom
                            label="Renda Individual"
                            mask="money"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Nome do Pai *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <InputCustom label="Nome da Mãe *" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="E-mail" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom
                          label="Telefone *"
                          mask="phone"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="CEP *" mask="cep" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Logradouro *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Número *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Bairro *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Cidade *" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referencePoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Ponto de Referência" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="originCharacteristics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Características do Local de Origem</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva as características do local de origem"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Naturalidade/Nacionalidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Globe" size={20} />
                Naturalidade/Nacionalidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom
                          label="Cidade de Nascimento *"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom
                          label="Nacionalidade"
                          placeholder="Brasileiro"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isMigrant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Reconheço que sou imigrante</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Título de Eleitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Vote" size={20} />
                Título de Eleitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="voterTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="N° Título" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="voterZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Zona" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="voterSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Seção" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="votingLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <InputCustom label="Local de Votação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Necessidades Especiais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Heart" size={20} />
                Necessidades Especiais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hasDisability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Possui algum tipo de deficiência?</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="max-w-xs">
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("hasDisability") === "sim" && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <FormLabel className="text-base font-medium">
                      Qual tipo de deficiência?
                    </FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {DISABILITY_OPTIONS.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={option.value}
                            checked={selectedDisabilities.includes(
                              option.value
                            )}
                            onCheckedChange={(checked) =>
                              handleDisabilityChange(
                                option.value,
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor={option.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="disabilityObservations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva observações sobre as necessidades especiais"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-6">
            <ButtonCustom
              type="submit"
              size="lg"
              icon="Save"
              className="min-w-[200px]"
            >
              Salvar Cadastro
            </ButtonCustom>
          </div>
        </form>
      </Form>
    </div>
  );
}
