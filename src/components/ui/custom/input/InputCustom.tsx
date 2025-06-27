"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import InputMaskService from "./InputMaskService";
import type { InputCustomProps } from "./types";

/**
 * Componente de input customizado com suporte para máscaras, validação,
 * estados visuais e muito mais.
 */
export const InputCustom = React.forwardRef<HTMLInputElement, InputCustomProps>(
  (
    {
      label,
      name,
      id,
      value = "",
      onChange,
      onFocus,
      onBlur,
      error,
      className,
      disabled = false,
      required = false,
      type = "text",
      placeholder = "",
      icon,
      rightIcon,
      mask,
      maskConfig,
      showPasswordToggle = false,
      size = "md",
      fullWidth = true,
      // isFloatingLabel removido por não ser usado
      helperText,
      maxLength,
      successMessage,
      onIconClick,
      onRightIconClick,
      ...props
    },
    ref
  ) => {
    // Refs e serviços
    const inputRef = useRef<HTMLInputElement>(null);
    // const [isFocused, setIsFocused] = useState(false); // removido, não utilizado
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [innerValue, setInnerValue] = useState<string>(value as string);
    const [touched, setTouched] = useState(false);

    // Determina o tipo efetivo do input (para alternância de visibilidade da senha)
    const effectiveType =
      isPasswordVisible && type === "password" ? "text" : type;

    // ID gerado automaticamente se não for fornecido
    const inputId =
      id || `input-custom-${name || Math.random().toString(36).substr(2, 9)}`;

    // Atualiza o valor interno quando o prop value muda
    useEffect(() => {
      setInnerValue(value as string);
    }, [value]);

    // Handler para mudança de valor
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskService = InputMaskService.getInstance(); // garantir sempre instância fresh por causa do hook warning
        const newValue = e.target.value;

        // Se tivermos uma máscara, aplicamos o processamento
        let processedValue = newValue;
        if (mask) {
          processedValue = maskService.processInput(newValue, mask, maskConfig);
        }

        // Atualiza o valor interno
        setInnerValue(processedValue);

        // Propaga a mudança para o componente pai com um evento simulado
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: {
              ...e.target,
              name: name || "",
              value: processedValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(syntheticEvent);
        }
      },
      [mask, maskConfig, name, onChange]
    );

    // Handler para foco no input
    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // setIsFocused(true); // removido
        if (onFocus) onFocus(e);
      },
      [onFocus]
    );

    // Handler para perda de foco no input
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // setIsFocused(false); // removido
        setTouched(true);

        if (onBlur) onBlur(e);
      },
      [onBlur]
    );

    // Alterna a visibilidade da senha
    const togglePasswordVisibility = useCallback(() => {
      setIsPasswordVisible((prev) => !prev);
    }, []);

    // Calcula as classes CSS com base nas propriedades e estado
    const containerClasses = cn(
      "group relative space-y-2",
      {
        "w-full": fullWidth,
        "min-w-[200px]": !fullWidth && size === "sm",
        "min-w-[250px]": !fullWidth && size === "md",
        "min-w-[300px]": !fullWidth && size === "lg",
      },
      className
    );

    // Aumentamos a altura do campo para todos os tamanhos
    const inputClasses = cn(
      "w-full text-foreground dark:bg-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      {
        "pr-10":
          icon || rightIcon || (type === "password" && showPasswordToggle),
        "h-10": size === "sm",
        "h-12": size === "md",
        "h-14": size === "lg",
        "border-destructive": error && touched,
        "border-emerald-500": successMessage && !error,
        "focus:border-blue-400 focus:ring-1 focus:ring-blue-300":
          !error && !successMessage,
      }
    );

    // Verifica se deve exibir o asterisco de obrigatório
    const showRequiredIndicator = required;

    // Determina o ícone a ser exibido (prioridade para o toggle de senha se for campo de senha)
    const displayIcon =
      type === "password" && showPasswordToggle
        ? isPasswordVisible
          ? "EyeOff"
          : "Eye"
        : icon || rightIcon;

    // Deve mostrar erro apenas quando o campo foi tocado e existe uma mensagem de erro
    const shouldShowError = touched && error;

    return (
      <div className={containerClasses}>
        {/* Label posicionado acima do input */}
        {label && (
          <Label
            htmlFor={inputId}
            className={cn("block text-sm font-medium", {
              "text-destructive": error && touched,
              "text-emerald-500": successMessage && !error,
            })}
          >
            {label}
            {showRequiredIndicator && (
              <span className="ml-1 text-destructive">*</span>
            )}
          </Label>
        )}

        {/* Container do input */}
        <div className="relative">
          <Input
            ref={ref || inputRef}
            id={inputId}
            name={name}
            type={effectiveType}
            value={innerValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            style={{
              caretColor: error
                ? "var(--destructive)"
                : "var(--blue-500, #3b82f6)",
            }}
            {...props}
          />

          {/* Ícone único do lado direito (pode ser o ícone do campo ou toggle de senha) */}
          {displayIcon && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground/70"
              onClick={
                type === "password" && showPasswordToggle
                  ? togglePasswordVisibility
                  : icon
                  ? onIconClick
                  : onRightIconClick
              }
            >
              <Icon
                name={displayIcon}
                size={size === "sm" ? 18 : size === "md" ? 20 : 22}
              />
            </div>
          )}
        </div>

        {/* Mensagem de erro ou texto de ajuda */}
        {shouldShowError && (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        )}

        {/* Mensagem de sucesso */}
        {!error && successMessage && (
          <p className="text-xs text-emerald-500">{successMessage}</p>
        )}

        {/* Texto de ajuda */}
        {!error && !successMessage && helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

InputCustom.displayName = "InputCustom";

export default InputCustom;
