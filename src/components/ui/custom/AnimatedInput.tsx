"use client";

import React, {
  useId,
  InputHTMLAttributes,
  useState,
  useEffect,
  useRef,
} from "react";
import { Input } from "@/components/ui/input";
import { IconName, Icon } from "./Icons";

/**
 * Tipos de máscaras suportadas
 */
type MaskType = "cpf" | "phone" | "cep" | "email" | "none";

/**
 * Interface para AnimatedInput props
 */
interface AnimatedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** O texto do rótulo */
  label: string;
  /** Tipo de entrada (text, email, password, etc) */
  type?: string;
  /** Placeholder do input (exibido apenas quando o campo estiver focado) */
  placeholder?: string;
  /** ID personalizado (opcional, gerado automaticamente se não fornecido) */
  id?: string;
  /** Classes CSS adicionais para o input */
  className?: string;
  /** Classes CSS adicionais para o rótulo */
  labelClassName?: string;
  /** Classes CSS adicionais para o div wrapper */
  wrapperClassName?: string;
  /** Tipo de máscara (cpf, phone, cep, email, none) */
  mask?: MaskType;
  /** Padrão de máscara personalizado (substitui o tipo de máscara) */
  maskPattern?: string;
  /** Props adicionais para passar ao elemento input */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  /** Mensagem de erro para exibir */
  error?: string;
  /** Se o campo é obrigatório (exibe asterisco vermelho) */
  required?: boolean;
  /** Elemento ou texto indicador de obrigatório personalizado */
  requiredIndicator?: React.ReactNode;
  /** Nome do ícone dos ícones Lucide para exibir no lado direito do input */
  icon?: IconName;
  /** Tamanho do ícone */
  iconSize?: number;
  /** Cor do ícone */
  iconColor?: string;
  /** Componente de ícone personalizado (substitui o nome do ícone) */
  customIcon?: React.ReactNode;
  /** Função a ser chamada quando o ícone é clicado */
  onIconClick?: () => void;
  /** Classes CSS adicionais para o ícone */
  iconClassName?: string;
}

/**
 * Componente de input com animação de rótulo, máscaras integradas e suporte a ícone no lado direito
 */
const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  type = "text",
  placeholder = "",
  id: customId,
  className = "",
  labelClassName = "",
  wrapperClassName = "",
  mask = "none",
  maskPattern,
  inputProps = {},
  error,
  onChange,
  value: externalValue,
  required = false,
  requiredIndicator,
  icon,
  iconSize = 18,
  iconColor,
  customIcon,
  onIconClick,
  iconClassName = "",
  ...rest
}) => {
  // Refs e IDs
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const id = customId || generatedId;

  // Estado
  const [internalValue, setInternalValue] = useState<string>(
    (externalValue as string) || ""
  );
  const [isValid, setIsValid] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [defaultIcon, setDefaultIcon] = useState<IconName | undefined>(
    undefined
  );

  // Sincronizar com valor externo quando ele muda
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== internalValue) {
      setInternalValue(externalValue as string);
    }
  }, [externalValue]);

  // Definir ícone automaticamente com base no tipo de máscara, se não fornecido
  useEffect(() => {
    if (!icon && !customIcon) {
      const iconMap: Record<MaskType, IconName | undefined> = {
        email: "Mail",
        phone: "Phone",
        cep: "MapPin",
        cpf: "User",
        none: undefined,
      };

      setDefaultIcon(iconMap[mask]);
    }
  }, [mask, icon, customIcon]);

  // Lidar com evento de envio do formulário
  useEffect(() => {
    const handleFormSubmit = () => {
      setSubmitted(true);
    };

    // Buscar o elemento form pai
    let element = document.getElementById(id);
    let formElement: HTMLFormElement | null = null;

    while (element && element.tagName !== "FORM") {
      element = element.parentElement;
      if (element && element.tagName === "FORM") {
        formElement = element as HTMLFormElement;
        break;
      }
    }

    if (formElement) {
      formElement.addEventListener("submit", handleFormSubmit);
      return () => {
        formElement?.removeEventListener("submit", handleFormSubmit);
      };
    }
  }, [id]);

  // Indicador obrigatório padrão
  const defaultRequiredIndicator = <span className="text-red-500">*</span>;

  // Tipo efetivo para campos de senha
  const effectiveType = type === "password" && showPassword ? "text" : type;

  // Definições de máscaras
  const masks: Record<MaskType, string> = {
    cpf: "999.999.999-99",
    phone: "(99) 9 9999-9999",
    cep: "99999-999",
    email: "",
    none: "",
  };

  // Padrões de validação
  const patterns: Record<MaskType, RegExp> = {
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    phone: /^\(\d{2}\) \d \d{4}-\d{4}$/,
    cep: /^\d{5}-\d{3}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    none: /.*/,
  };

  // Mensagens de erro para validação
  const validationMessages: Record<MaskType, string> = {
    cpf: "CPF inválido",
    phone: "Telefone inválido",
    cep: "CEP inválido",
    email: "Email inválido",
    none: "Formato inválido",
  };

  /**
   * Aplica a máscara ao valor
   */
  const applyMask = (value: string, pattern: string): string => {
    if (!pattern) return value;

    let result = "";
    let valueIndex = 0;

    for (let i = 0; i < pattern.length && valueIndex < value.length; i++) {
      if (pattern[i] === "9") {
        if (/\d/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          valueIndex++;
          i--;
        }
      } else {
        result += pattern[i];
      }
    }

    return result;
  };

  /**
   * Remove caracteres não alfanuméricos do valor (para aplicar máscara)
   */
  const removeMask = (value: string): string => {
    return value.replace(/[^\w@.-]/g, "");
  };

  /**
   * Manipulador para mudança de valor
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Aplicar máscara se necessário
    if (mask !== "none" || maskPattern) {
      const maskToUse = maskPattern || masks[mask];

      if (mask === "email") {
        // Para email, apenas validamos, não aplicamos máscara
        setIsValid(patterns.email.test(newValue));
      } else if (maskToUse) {
        // Removemos caracteres não numéricos para aplicar a máscara
        const rawValue = removeMask(newValue);
        newValue = applyMask(rawValue, maskToUse);

        // Validamos conforme o padrão
        if (mask !== "none") {
          setIsValid(patterns[mask].test(newValue));
        }
      }
    }

    // Atualiza o estado interno apenas se não for controlado externamente
    if (externalValue === undefined) {
      setInternalValue(newValue);
    }

    // Criamos um evento sintético para manter a compatibilidade
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: newValue,
      },
    };

    // Chamar onChange externo se fornecido
    if (onChange) {
      onChange(syntheticEvent);
    }
  };

  /**
   * Manipuladores de eventos de foco
   */
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTouched(true);
  };

  /**
   * Manipulador para clique no ícone
   */
  const handleIconClick = () => {
    // Se for input de senha, alternar visibilidade
    if (type === "password") {
      setShowPassword(!showPassword);
    }

    // Chamar função de clique personalizada, se fornecida
    if (onIconClick) {
      onIconClick();
    }
  };

  /**
   * Renderiza o ícone apropriado
   */
  const renderIcon = () => {
    if (type === "password") {
      return (
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 ${iconClassName}`}
          onClick={handleIconClick}
          role="button"
          tabIndex={-1}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon
            name={showPassword ? "EyeOff" : "Eye"}
            size={iconSize}
            color={iconColor}
          />
        </div>
      );
    }

    if (customIcon) {
      return (
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            onIconClick ? "cursor-pointer" : ""
          } text-gray-500 ${iconClassName}`}
          onClick={onIconClick ? handleIconClick : undefined}
          role={onIconClick ? "button" : undefined}
          tabIndex={onIconClick ? -1 : undefined}
        >
          {customIcon}
        </div>
      );
    }

    if (icon || defaultIcon) {
      return (
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${
            onIconClick ? "cursor-pointer" : ""
          } text-gray-500 ${iconClassName}`}
          onClick={onIconClick ? handleIconClick : undefined}
          role={onIconClick ? "button" : undefined}
          tabIndex={onIconClick ? -1 : undefined}
        >
          <Icon
            name={icon || (defaultIcon as IconName)}
            size={iconSize}
            color={iconColor}
          />
        </div>
      );
    }

    return null;
  };

  // Determinamos qual valor usar (externo ou interno)
  const valueToUse =
    externalValue !== undefined ? (externalValue as string) : internalValue;
  const hasValue = Boolean(valueToUse);

  // Verificações para exibir mensagens de erro
  const showValidationError = !isValid && valueToUse.length > 0 && touched;
  const showRequiredError =
    required && valueToUse === "" && (touched || submitted);
  const hasError = error || showValidationError || showRequiredError;

  // Calculamos se devemos mostrar o placeholder
  // Agora só mostramos o placeholder quando o campo está focado e vazio
  const shouldShowPlaceholder = isFocused && !hasValue;

  return (
    <div className={`group relative min-w-[300px] ${wrapperClassName}`}>
      <div className="relative">
        <label
          htmlFor={id}
          className={`absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center px-4 text-sm text-muted-foreground/70 transition-all duration-200 group-focus-within:top-0 group-focus-within:translate-y-[-50%] group-focus-within:scale-90 group-focus-within:bg-background group-focus-within:px-2 group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground ${
            hasValue
              ? "top-0 translate-y-[-50%] scale-90 bg-background px-2 text-xs font-medium text-foreground"
              : ""
          } ${labelClassName}`}
        >
          {label}
          {required && (requiredIndicator || defaultRequiredIndicator)}
        </label>
        <Input
          ref={inputRef}
          id={id}
          type={effectiveType}
          value={valueToUse}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={shouldShowPlaceholder ? placeholder : ""}
          className={`peer h-12 ${className} ${
            icon || defaultIcon || customIcon || type === "password"
              ? "pr-10"
              : ""
          } ${hasError ? "border-red-500 focus:border-red-500" : ""}`}
          required={required}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={hasError ? `${id}-error` : undefined}
          {...inputProps}
          {...rest}
        />
        {renderIcon()}
      </div>
      {hasError && (
        <p
          id={`${id}-error`}
          className="mt-1 text-xs text-red-500"
          role="alert"
        >
          {error ||
            (showValidationError && validationMessages[mask]) ||
            (showRequiredError && "Este campo é obrigatório")}
        </p>
      )}
    </div>
  );
};

export { AnimatedInput };
