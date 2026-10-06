"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { MailCheck } from "lucide-react";

export function SignUpForm() {
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [sent, setSent] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const parsed = signUpSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setErrors(Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ));
      return;
    }

    setLoading(true);
    // Created only on submit, in the browser — never during server
    // prerendering, so a missing NEXT_PUBLIC_SUPABASE_* env var at build
    // time can't crash the build (see src/app/(auth)/cadastro/page.tsx).
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }

    setSent(parsed.data.email);
  }

  if (sent) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
          <MailCheck className="h-5 w-5 text-brand" />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink">Confirme seu e-mail</h1>
        <p className="mt-2 text-sm text-muted">
          Enviamos um link de confirmação para <strong className="text-ink">{sent}</strong>.
          Abra o e-mail para ativar sua conta e continuar.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-semibold text-ink">Criar conta gratuita</h1>
      <p className="mt-1 text-sm text-muted">
        Comece a prospectar em minutos. Sem cartão de crédito.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" placeholder="Seu nome" autoComplete="name" />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" />
          <p className="mt-1 text-xs text-muted">Mínimo 8 caracteres, com letra maiúscula, minúscula e número.</p>
          <FieldError>{errors.password}</FieldError>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Criar conta
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
