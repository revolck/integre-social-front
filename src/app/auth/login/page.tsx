"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputCustom } from "@/components/ui/custom/input";

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
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center  px-6 py-12">
        <div className="max-w-md w-full space-y-6">
          {/* Logo */}
          <Image
            src="/logo-white.svg"
            width={120}
            height={40}
            alt="Logo da aplicação"
            className="mx-auto"
          />

          {/* Cabeçalho */}
          <h1 className="text-3xl font-semibold">
            Olá, Filipe.
            <br />
            Que bom te ver de novo!
          </h1>

          {/* Formulário */}
          <div className="space-y-4">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
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
                  />
                </div>
              </div>

              {/* Opções adicionais */}
              <div className="flex justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="font-normal text-muted-foreground"
                  >
                    Me mantenha na conta
                  </Label>
                </div>
                <Link
                  href="/auth/recuperar-senha"
                  className="text-sm underline hover:no-underline text-primary"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de submissão */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>

          {/* Termos */}
          <p className="text-xs text-gray-500 text-center">
            Ao continuar, você concorda com nossos{" "}
            <Link href="/termos" className="underline text-primary">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="underline text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Lado direito - Imagem */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/images/signup-collage.png"
          alt="Colagem de capturas de tela do app"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
        />
      </div>
    </div>
  );
}
