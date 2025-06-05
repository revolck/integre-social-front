"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
  progress?: number; // 0-100
  variant?: "default" | "minimal" | "detailed";
}

/**
 * Componente de tela de carregamento reutilizável
 * Suporta diferentes variantes e estados de loading
 */
export function LoadingScreen({
  message = "Carregando...",
  subMessage,
  className,
  size = "md",
  showLogo = true,
  progress,
  variant = "default",
}: LoadingScreenProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const containerClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="flex items-center space-x-3">
          <Spinner size={size} />
          <span className="text-sm text-muted-foreground">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-background",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center text-center max-w-md w-full px-6",
          containerClasses[size]
        )}
      >
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary-foreground">
                {siteConfig.name.charAt(0)}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {siteConfig.name}
            </h1>
          </div>
        )}

        {/* Loading Spinner */}
        <div className="relative">
          <Spinner size={size} />

          {/* Progress ring se tiver progresso */}
          {progress !== undefined && (
            <svg
              className={cn(
                "absolute inset-0 transform -rotate-90",
                sizeClasses[size]
              )}
              viewBox="0 0 36 36"
            >
              <path
                className="stroke-muted-foreground/20"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={`${progress}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          )}
        </div>

        {/* Mensagens */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>

          {subMessage && (
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          )}

          {progress !== undefined && (
            <p className="text-xs text-muted-foreground font-mono">
              {Math.round(progress)}%
            </p>
          )}
        </div>

        {/* Informações adicionais para variant detailed */}
        {variant === "detailed" && (
          <div className="mt-8 space-y-2 text-xs text-muted-foreground">
            <p>Versão {siteConfig.version || "1.0.0"}</p>
            <div className="flex items-center justify-center space-x-4">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Conectado</span>
              </span>
              <span>|</span>
              <span>Ambiente: {process.env.NODE_ENV}</span>
            </div>
          </div>
        )}

        {/* Dots animados */}
        <div className="flex space-x-1 mt-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

/**
 * Componente de spinner reutilizável
 */
function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className={cn(
          "absolute inset-0 border-2 border-muted-foreground/20 rounded-full",
          sizeClasses[size]
        )}
      />
      <div
        className={cn(
          "absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

/**
 * Loading simples inline
 */
export function InlineLoading({
  message = "Carregando...",
  size = "sm",
  className,
}: {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center space-x-3 py-4", className)}>
      <Spinner size={size} />
      <span className="text-sm text-muted-foreground animate-pulse">
        {message}
      </span>
    </div>
  );
}

/**
 * Loading para botões
 */
export function ButtonLoading({
  size = "sm",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "border-2 border-current border-t-transparent rounded-full animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Loading skeleton para cards
 */
export function SkeletonLoading({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted-foreground/10 rounded animate-pulse"
          style={{
            width: `${Math.random() * 40 + 60}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
