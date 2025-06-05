/**
 * Tipos globais da aplicação
 * Centraliza tipos compartilhados entre diferentes módulos
 */

import { UserRole } from "@/config/auth";

// Tipos básicos de entidades
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: string[];
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  lastLogin?: Date;
  status: "active" | "inactive" | "suspended";
  metadata?: Record<string, any>;
}

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  plan: "free" | "basic" | "premium" | "enterprise";
  status: "active" | "trial" | "suspended" | "inactive";
  features: string[];
  settings: OrganizationSettings;
  metadata?: Record<string, any>;
}

export interface OrganizationSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sms: boolean;
  };
  security: {
    requireMFA: boolean;
    sessionTimeout: number;
    passwordPolicy: PasswordPolicy;
  };
  features: {
    [key: string]: boolean;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxAge: number; // dias
  historyCount: number; // quantas senhas anteriores lembrar
}

// Tipos de API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
  success: boolean;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // Para erros de validação
  timestamp: string;
  requestId?: string;
}

// Tipos de Formulário
export interface FormField<T = any> {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "file"
    | "date"
    | "datetime-local"
    | "time";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  value?: T;
  defaultValue?: T;
  options?: SelectOption[]; // Para select e radio
  validation?: ValidationRule[];
  mask?: string;
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  multiple?: boolean; // Para file e select
  accept?: string; // Para file
  rows?: number; // Para textarea
  cols?: number; // Para textarea
  className?: string;
  helpText?: string;
  errorText?: string;
  successText?: string;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ValidationRule {
  type: "required" | "email" | "min" | "max" | "pattern" | "custom";
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Tipos de Estado
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number; // 0-100
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiError | null;
  errorMessage?: string;
  errorCode?: string;
  retryable?: boolean;
}

export interface AsyncState<T = any> extends LoadingState, ErrorState {
  data?: T;
  lastFetched?: Date;
  isStale?: boolean;
}

// Tipos de Notificação
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  category: "system" | "user" | "financial" | "security" | "update";
  read: boolean;
  timestamp: Date;
  expiresAt?: Date;
  userId?: string;
  organizationId?: string;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: string;
  url?: string;
  payload?: Record<string, any>;
}

// Tipos de Arquivo
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  metadata?: Record<string, any>;
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // Para vídeos/áudios
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
  alt?: string; // Para imagens
}

// Tipos de Evento/Auditoria
export interface AuditLog extends BaseEntity {
  userId: string;
  userName: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ip: string;
  userAgent: string;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface SystemEvent {
  id: string;
  type: "system" | "user" | "security" | "performance" | "error";
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

// Tipos de Configuração
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions?: FeatureCondition[];
  rolloutPercentage?: number; // 0-100
  startDate?: Date;
  endDate?: Date;
}

export interface FeatureCondition {
  type: "user" | "organization" | "plan" | "custom";
  operator: "equals" | "not_equals" | "in" | "not_in" | "contains" | "regex";
  field: string;
  value: any;
}

// Tipos de Pesquisa/Filtro
export interface SearchFilters {
  query?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  category?: string[];
  tags?: string[];
  userId?: string;
  organizationId?: string;
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  order: "asc" | "desc";
  type?: "string" | "number" | "date";
}

// Tipos de Dashboard/Analytics
export interface MetricData {
  name: string;
  value: number | string;
  change?: number; // Percentual de mudança
  changeType?: "increase" | "decrease" | "neutral";
  format?: "number" | "currency" | "percentage" | "bytes" | "duration";
  period?: string;
  target?: number;
  unit?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  options?: Record<string, any>;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  tension?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
}

// Utilitários TypeScript
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Tipos de Estado Global
export interface AppState {
  user: User | null;
  organization: Organization | null;
  theme: "light" | "dark" | "system";
  language: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  lastActivity: Date | null;
  notifications: NotificationData[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: {
    email: boolean;
    browser: boolean;
    desktop: boolean;
    mobile: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  dashboard: {
    layout: "grid" | "list";
    density: "compact" | "normal" | "comfortable";
    defaultPage: string;
  };
}

// Tipos para extensibilidade
export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  settings: Record<string, any>;
  permissions: string[];
  dependencies?: string[];
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: "api" | "webhook" | "oauth" | "database";
  enabled: boolean;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  lastSync?: Date;
  status: "active" | "error" | "disabled";
}

// Tipos de Webhook
export interface WebhookEvent {
  id: string;
  type: string;
  source: string;
  data: Record<string, any>;
  timestamp: Date;
  organizationId: string;
  userId?: string;
  processed: boolean;
  processedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  organizationId: string;
  lastDelivery?: Date;
  failureCount: number;
  settings: {
    timeout: number;
    retries: number;
    headers?: Record<string, string>;
  };
}
