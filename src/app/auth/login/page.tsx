"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputCustom } from "@/components/ui/custom/input";
import { DarkTheme } from "@/components/partials/darkTheme/darkTheme";

/**
 * Página de Login
 *
 * Implementa o fluxo de autenticação do usuário com validação de CPF e senha.
 */
export default function LoginPage() {
  // Estado do formulário
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  });

  // Estado de erros
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado de loading
  const [loading, setLoading] = useState(false);

  // Estado para animação de entrada
  const [isVisible, setIsVisible] = useState(false);

  // Trigger de animação na montagem do componente
  useEffect(() => {
    setIsVisible(true);
  }, []);

  /**
   * Handler para mudança nos campos do formulário
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Atualiza o valor do campo
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handler para envio do formulário
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validação básica
    const newErrors: Record<string, string> = {};

    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);

    // Se não houver erros, processa o login
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      // Aqui seria feita a chamada para a API de autenticação
      console.log("Login iniciado:", formData);

      // Simulação de API call
      setTimeout(() => {
        setLoading(false);
        // Redirecionamento ou tratamento de sucesso
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Theme Toggle - Posicionado no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <DarkTheme />
      </div>

      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 bg-background transition-colors duration-300">
        <div
          className={`max-w-md w-full space-y-8 transition-all duration-500 ease-in-out transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logo-white.svg"
              width={130}
              height={45}
              alt="Logo da aplicação"
              className="mx-auto dark:invert transition-all duration-300"
            />
          </div>

          {/* Cabeçalho */}
          <div className="space-y-2 text-center lg:text-left mb-4">
            <h1 className="text-3xl font-bold text-foreground transition-colors duration-300 mb-0">
              Olá, Filipe.
            </h1>
            <p className="text-lg text-muted-foreground transition-colors duration-300">
              Que bom te ver de novo!
            </p>
          </div>

          {/* Formulário */}
          <div
            className={`space-y-6 transition-all duration-500 ease-in-out delay-100 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Input CPF */}
                <div className="space-y-2">
                  <InputCustom
                    label="CPF"
                    type="text"
                    name="cpf"
                    mask="cpf"
                    icon="User"
                    value={formData.cpf}
                    onChange={handleChange}
                    error={errors.cpf}
                    required
                    size="md"
                    disabled={loading}
                  />
                </div>

                {/* Input Senha */}
                <div className="space-y-2">
                  <InputCustom
                    label="Senha"
                    type="password"
                    name="senha"
                    icon="Lock"
                    showPasswordToggle
                    value={formData.senha}
                    onChange={handleChange}
                    error={errors.senha}
                    required
                    size="md"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Opções adicionais */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" disabled={loading} />
                  <Label
                    htmlFor="remember"
                    className={`font-normal text-muted-foreground cursor-pointer text-sm transition-colors duration-300 ${
                      loading ? "opacity-50" : ""
                    }`}
                  >
                    Me mantenha na conta
                  </Label>
                </div>
                <Link
                  href="/auth/recuperar-senha"
                  className={`text-sm text-primary hover:text-primary/80 transition-colors duration-200 hover:underline ${
                    loading ? "pointer-events-none opacity-50" : ""
                  }`}
                  tabIndex={loading ? -1 : 0}
                  aria-disabled={loading}
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de submissão */}
              <Button
                type="submit"
                className="w-full h-12 text-base transition-all duration-300 relative overflow-hidden"
                disabled={loading}
              >
                <span
                  className={`transition-all duration-300 ${
                    loading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Entrar
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Termos */}
          <p
            className={`text-xs text-muted-foreground text-center transition-all duration-500 ease-in-out delay-200 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="/termos"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link
              href="/privacidade"
              className="text-primary hover:underline transition-colors duration-200"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Lado direito - Imagem */}
      <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-purple-500/90 to-blue-600/90">
        <div className="absolute inset-0 bg-black/30 z-0"></div>
        <Image
          src="/images/signup-collage.png"
          alt="Colagem de capturas de tela do app"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
          className={`transition-all duration-1000 ease-in-out ${
            isVisible ? "scale-100 opacity-80" : "scale-110 opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
