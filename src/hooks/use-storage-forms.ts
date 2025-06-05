"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { sanitizeInput, containsMaliciousContent } from "@/config/security";

/**
 * Hook para localStorage seguro com criptografia
 */
export function useSecureStorage<T>(key: string, defaultValue: T) {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Função simples de "criptografia" (em produção usar crypto-js)
  const encrypt = useCallback((value: string): string => {
    // Em produção, usar uma biblioteca de criptografia adequada
    return btoa(value);
  }, []);

  const decrypt = useCallback((value: string): string => {
    try {
      return atob(value);
    } catch {
      return "";
    }
  }, []);

  // Carregar valor inicial
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        if (item) {
          const decryptedItem = decrypt(item);
          const parsedItem = JSON.parse(decryptedItem);
          setStoredValue(parsedItem);
        }
      }
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      setStoredValue(defaultValue);
    } finally {
      setIsLoading(false);
    }
  }, [key, defaultValue, decrypt]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          const serializedValue = JSON.stringify(valueToStore);
          const encryptedValue = encrypt(serializedValue);
          localStorage.setItem(key, encryptedValue);
        }
      } catch (error) {
        console.error(`Erro ao salvar ${key} no localStorage:`, error);
      }
    },
    [key, storedValue, encrypt]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage:`, error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue, isLoading] as const;
}

/**
 * Hook para gerenciar formulários com validação
 */
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => void | Promise<void>;
  resetOnSubmit?: boolean;
  sanitize?: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  resetOnSubmit = false,
  sanitize = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Validar formulário
  const validateForm = useCallback(
    (formValues: T) => {
      if (!validate) return {};

      const validationErrors = validate(formValues);
      setErrors(validationErrors);
      setIsValid(Object.keys(validationErrors).length === 0);

      return validationErrors;
    },
    [validate]
  );

  // Atualizar valor de campo
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      let sanitizedValue = value;

      // Sanitizar input se habilitado
      if (sanitize && typeof value === "string") {
        if (containsMaliciousContent(value)) {
          console.warn(`Conteúdo malicioso detectado no campo ${String(name)}`);
          return; // Não atualizar o valor
        }
        sanitizedValue = sanitizeInput(value);
      }

      setValues((prev) => ({ ...prev, [name]: sanitizedValue }));

      // Marcar campo como tocado
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Validar apenas este campo se já foi tocado
      if (touched[name] && validate) {
        const newValues = { ...values, [name]: sanitizedValue };
        validateForm(newValues);
      }
    },
    [values, touched, validate, validateForm, sanitize]
  );

  // Atualizar múltiplos valores
  const setValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Marcar campo como tocado
  const setTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));
  }, []);

  // Resetar formulário
  const reset = useCallback(
    (newInitialValues?: T) => {
      const resetValues = newInitialValues || initialValues;
      setValues(resetValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
      setIsValid(true);
    },
    [initialValues]
  );

  // Handle blur (marcar como tocado e validar)
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validate) {
        validateForm(values);
      }
    },
    [values, validate, validateForm]
  );

  // Handle change
  const handleChange = useCallback(
    (
      nameOrEvent:
        | keyof T
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >,
      value?: any
    ) => {
      if (typeof nameOrEvent === "string") {
        // Chamada direta: handleChange("fieldName", value)
        setValue(nameOrEvent, value);
      } else {
        // Event handler: handleChange(event)
        const event = nameOrEvent;
        const { name, value, type, checked } = event.target as HTMLInputElement;
        const fieldValue = type === "checkbox" ? checked : value;
        setValue(name as keyof T, fieldValue);
      }
    },
    [setValue]
  );

  // Submit do formulário
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Marcar todos os campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setTouched(allTouched);

      // Validar formulário
      const validationErrors = validateForm(values);

      if (Object.keys(validationErrors).length > 0) {
        return false; // Formulário inválido
      }

      if (!onSubmit) {
        return true;
      }

      try {
        setIsSubmitting(true);
        await onSubmit(values);

        if (resetOnSubmit) {
          reset();
        }

        return true;
      } catch (error) {
        console.error("Erro no submit do formulário:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit, resetOnSubmit, reset]
  );

  // Validar on mount e quando values mudam
  useEffect(() => {
    if (validate) {
      validateForm(values);
    }
  }, [values, validate, validateForm]);

  // Helper para obter props de campo
  const getFieldProps = useCallback(
    (name: keyof T) => {
      return {
        name: String(name),
        value: values[name] || "",
        onChange: handleChange,
        onBlur: () => handleBlur(name),
        error: touched[name] ? errors[String(name)] : undefined,
      };
    },
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

/**
 * Hook para debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para detectar clique fora do elemento
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

/**
 * Hook para copiar texto para clipboard
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset após 2 segundos
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);

      return true;
    } catch (error) {
      console.error("Erro ao copiar para clipboard:", error);

      // Fallback para browsers antigos
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setCopied(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => setCopied(false), 2000);

        return true;
      } catch (fallbackError) {
        console.error("Fallback copy também falhou:", fallbackError);
        return false;
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copied };
}

/**
 * Hook para detecção de teclas
 */
export function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [targetKey, handler]);
}

/**
 * Hook para scroll infinito
 */
export function useInfiniteScroll(callback: () => void, threshold = 100) {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight - threshold
      ) {
        return;
      }
      setIsFetching(true);
    };

    document.addEventListener("scroll", handleScroll);
    return () => document.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  useEffect(() => {
    if (!isFetching) return;
    callback();
    setIsFetching(false);
  }, [isFetching, callback]);

  return [isFetching, setIsFetching] as const;
}
