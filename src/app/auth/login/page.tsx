"use client";
import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AnimatedInput } from "@/components/ui/custom/AnimatedInput";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.cpf) newErrors.cpf = "CPF é obrigatório";
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      // Here you would handle the login logic
      console.log("Login submitted:", formData);

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // Redirect or handle successful login
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white dark:bg-black dark:text-white tx__black px-6 py-12">
        <div className="max-w-md w-full space-y-6">
          <Image
            src="/logo-white.svg"
            width={120}
            height={40}
            alt="Mobbin Logo"
            className="mx-auto"
          />

          {/* Heading */}
          <h1 className="text-3xl font-semibold">
            Olá, Filipe.
            <br />
            Que bom te ver de novo!
          </h1>

          <div className="space-y-4">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <AnimatedInput
                    label="CPF"
                    type="text"
                    name="cpf"
                    mask="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    error={errors.cpf}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <AnimatedInput
                    label="Senha"
                    type="password"
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    error={errors.senha}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="remenber" />
                  <Label
                    htmlFor="remenber"
                    className="font-normal text-muted-foreground"
                  >
                    Me mantenha na conta
                  </Label>
                </div>
                <a className="text-sm underline hover:no-underline" href="#">
                  Esqueceu a senha?
                </a>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to Mobbin's{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right: Image Collage */}
      <div className="hidden lg:block w-1/2 relative">
        <Image
          src="/images/signup-collage.png"
          alt="App screenshots collage"
          fill
          style={{ objectFit: "cover" }}
          quality={100}
          priority
        />
      </div>
    </div>
  );
}
