/**
 * Utilitários de validação seguros
 * Implementa validação de dados, sanitização e schemas Zod
 */

import { z } from "zod";
import { sanitizeInput, containsMaliciousContent } from "@/config/security";

// Regex patterns seguros
export const VALIDATION_PATTERNS = {
  // Documentos brasileiros
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CEP: /^\d{5}-?\d{3}$/,
  PHONE: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,

  // Formatos comuns
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // Segurança
  SAFE_STRING: /^[a-zA-Z0-9À-ÿ\s\-_.,!?()]{1,1000}$/,
  SAFE_NAME: /^[a-zA-ZÀ-ÿ\s\-'\.]{2,100}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  SLUG: /^[a-z0-9-]+$/,

  // Financeiro
  CURRENCY: /^\d{1,10}(\.\d{2})?$/,
  PERCENTAGE: /^(100|[1-9]?\d)(\.\d+)?$/,
} as const;

/**
 * Transformações personalizadas para Zod
 */
export const zodTransforms = {
  // Sanitizar string
  sanitizeString: z.string().transform((val) => {
    if (containsMaliciousContent(val)) {
      throw new Error("Conteúdo malicioso detectado");
    }
    return sanitizeInput(val);
  }),

  // Normalizar email
  normalizeEmail: z.string().transform((val) => val.toLowerCase().trim()),

  // Remover formatação de CPF/CNPJ
  unformatDocument: z.string().transform((val) => val.replace(/[^\d]/g, "")),

  // Normalizar telefone
  normalizePhone: z.string().transform((val) => val.replace(/[^\d]/g, "")),

  // Converter para slug
  toSlug: z.string().transform((val) =>
    val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  ),
};

/**
 * Validadores customizados para Zod
 */
export const zodValidators = {
  // Validar CPF
  cpf: z.string().refine(validateCPF, {
    message: "CPF inválido",
  }),

  // Validar CNPJ
  cnpj: z.string().refine(validateCNPJ, {
    message: "CNPJ inválido",
  }),

  // Validar senha forte
  strongPassword: z.string().refine(validateStrongPassword, {
    message:
      "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial",
  }),

  // Validar arquivo
  file: z.object({
    name: z.string(),
    size: z.number().max(10 * 1024 * 1024, "Arquivo muito grande (max 10MB)"),
    type: z.string().refine((type) => {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      return allowedTypes.includes(type);
    }, "Tipo de arquivo não permitido"),
  }),

  // Validar data no passado
  pastDate: z.date().refine((date) => date < new Date(), {
    message: "Data deve estar no passado",
  }),

  // Validar data no futuro
  futureDate: z.date().refine((date) => date > new Date(), {
    message: "Data deve estar no futuro",
  }),

  // Validar URL segura
  safeUrl: z
    .string()
    .url()
    .refine((url) => {
      const allowedProtocols = ["http:", "https:"];
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    }, "URL deve usar HTTP ou HTTPS"),
};

/**
 * Schemas base reutilizáveis
 */
export const baseSchemas = {
  // Identificadores
  id: z.string().uuid("ID deve ser um UUID válido"),
  slug: z.string().regex(VALIDATION_PATTERNS.SLUG, "Slug inválido"),

  // Dados pessoais
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(VALIDATION_PATTERNS.SAFE_NAME, "Nome contém caracteres inválidos"),

  email: zodTransforms.normalizeEmail
    .email("Email inválido")
    .max(254, "Email muito longo"),

  phone: z
    .string()
    .regex(VALIDATION_PATTERNS.PHONE, "Telefone inválido")
    .or(z.string().length(0)),

  // Documentos
  cpf: zodTransforms.unformatDocument.pipe(zodValidators.cpf),
  cnpj: zodTransforms.unformatDocument.pipe(zodValidators.cnpj),
  cep: z.string().regex(VALIDATION_PATTERNS.CEP, "CEP inválido"),

  // Financeiro
  currency: z
    .number()
    .positive("Valor deve ser positivo")
    .max(999999999.99, "Valor muito alto"),

  percentage: z
    .number()
    .min(0, "Percentual deve ser maior que 0")
    .max(100, "Percentual deve ser menor que 100"),

  // Datas
  date: z.string().pipe(z.coerce.date()),
  dateRange: z
    .object({
      start: z.date(),
      end: z.date(),
    })
    .refine((data) => data.start <= data.end, {
      message: "Data de início deve ser anterior à data de fim",
      path: ["end"],
    }),

  // Paginação
  pagination: z.object({
    page: z.number().int().min(1, "Página deve ser maior que 0"),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(100, "Tamanho da página deve ser entre 1 e 100"),
  }),

  // Ordenação
  sort: z.object({
    field: z.string().min(1, "Campo de ordenação é obrigatório"),
    order: z.enum(["asc", "desc"]),
  }),
} as const;

/**
 * Schemas para entidades principais
 */
export const schemas = {
  // Usuário
  user: {
    create: z.object({
      name: baseSchemas.name,
      email: baseSchemas.email,
      password: zodValidators.strongPassword,
      phone: baseSchemas.phone.optional(),
      role: z.enum([
        "ADMIN",
        "GERENTE",
        "ATENDENTE",
        "BENEFICIADO",
        "PROF_SAUDE",
        "RH",
        "FINANCEIRO",
        "VIEWER",
      ]),
      organizationId: baseSchemas.id,
    }),

    update: z.object({
      name: baseSchemas.name.optional(),
      email: baseSchemas.email.optional(),
      phone: baseSchemas.phone.optional(),
      role: z
        .enum([
          "ADMIN",
          "GERENTE",
          "ATENDENTE",
          "BENEFICIADO",
          "PROF_SAUDE",
          "RH",
          "FINANCEIRO",
          "VIEWER",
        ])
        .optional(),
    }),

    changePassword: z
      .object({
        currentPassword: z.string().min(1, "Senha atual é obrigatória"),
        newPassword: zodValidators.strongPassword,
        confirmPassword: z.string(),
      })
      .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Senhas não conferem",
        path: ["confirmPassword"],
      }),
  },

  // Organização
  organization: {
    create: z.object({
      name: z.string().min(2).max(100),
      slug: zodTransforms.toSlug.pipe(z.string().min(2).max(50)),
      description: z.string().max(500).optional(),
      logo: z.string().url().optional(),
    }),

    update: z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      logo: z.string().url().optional(),
    }),
  },

  // Beneficiário
  beneficiary: {
    create: z.object({
      name: baseSchemas.name,
      email: baseSchemas.email.optional(),
      phone: baseSchemas.phone.optional(),
      cpf: baseSchemas.cpf,
      birthDate: baseSchemas.date.pipe(zodValidators.pastDate),
      address: z.object({
        street: z.string().min(5).max(200),
        number: z.string().max(10),
        complement: z.string().max(100).optional(),
        neighborhood: z.string().min(2).max(100),
        city: z.string().min(2).max(100),
        state: z.string().length(2),
        cep: baseSchemas.cep,
      }),
      familyIncome: baseSchemas.currency.optional(),
      familySize: z.number().int().min(1).max(20),
    }),

    update: z.object({
      name: baseSchemas.name.optional(),
      email: baseSchemas.email.optional(),
      phone: baseSchemas.phone.optional(),
      address: z
        .object({
          street: z.string().min(5).max(200),
          number: z.string().max(10),
          complement: z.string().max(100).optional(),
          neighborhood: z.string().min(2).max(100),
          city: z.string().min(2).max(100),
          state: z.string().length(2),
          cep: baseSchemas.cep,
        })
        .optional(),
      familyIncome: baseSchemas.currency.optional(),
      familySize: z.number().int().min(1).max(20).optional(),
    }),
  },

  // Autenticação
  auth: {
    login: z.object({
      email: baseSchemas.email,
      password: z.string().min(1, "Senha é obrigatória"),
      rememberMe: z.boolean().optional(),
    }),

    register: z
      .object({
        name: baseSchemas.name,
        email: baseSchemas.email,
        password: zodValidators.strongPassword,
        confirmPassword: z.string(),
        termsAccepted: z.boolean().refine((val) => val === true, {
          message: "Você deve aceitar os termos de uso",
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Senhas não conferem",
        path: ["confirmPassword"],
      }),

    forgotPassword: z.object({
      email: baseSchemas.email,
    }),

    resetPassword: z
      .object({
        token: z.string().min(1, "Token é obrigatório"),
        password: zodValidators.strongPassword,
        confirmPassword: z.string(),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Senhas não conferem",
        path: ["confirmPassword"],
      }),
  },

  // Pesquisa e filtros
  search: {
    general: z.object({
      query: z.string().max(200).optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).default("asc"),
      filters: z.record(z.any()).optional(),
    }),

    dateRange: z
      .object({
        startDate: baseSchemas.date.optional(),
        endDate: baseSchemas.date.optional(),
      })
      .refine(
        (data) => {
          if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate;
          }
          return true;
        },
        {
          message: "Data inicial deve ser anterior à data final",
          path: ["endDate"],
        }
      ),
  },
} as const;

/**
 * Funções de validação específicas
 */

// Validar CPF
export function validateCPF(cpf: string): boolean {
  // Remove formatação
  const cleanCPF = cpf.replace(/[^\d]/g, "");

  if (cleanCPF.length !== 11) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  if (parseInt(cleanCPF.charAt(9)) !== firstDigit) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  return parseInt(cleanCPF.charAt(10)) === secondDigit;
}

// Validar CNPJ
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

  if (cleanCNPJ.length !== 14) return false;

  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;

  if (parseInt(cleanCNPJ.charAt(12)) !== firstDigit) return false;

  // Validar segundo dígito verificador
  sum = 0;
  weight = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;

  return parseInt(cleanCNPJ.charAt(13)) === secondDigit;
}

// Validar senha forte
export function validateStrongPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

// Validar arquivo
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "Arquivo muito grande (máximo 10MB)" };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não permitido" };
  }

  return { valid: true };
}

/**
 * Utilitário para validar requests de API
 */
export async function validateRequest(
  request: Request,
  schema: z.ZodSchema
): Promise<{ success: boolean; data?: any; errors?: any }> {
  try {
    let data: any;

    if (request.method !== "GET") {
      const body = await request.json();
      data = body;
    } else {
      const url = new URL(request.url);
      data = Object.fromEntries(url.searchParams.entries());
    }

    const result = schema.parse(data);

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      };
    }

    return {
      success: false,
      errors: [{ message: "Erro de validação" }],
    };
  }
}

/**
 * Utilitário para sanitizar objetos
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    if (containsMaliciousContent(obj)) {
      throw new Error("Conteúdo malicioso detectado");
    }
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }

    return sanitized;
  }

  return obj;
}
