"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { ArrowLeft, MailCheck } from "lucide-react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    setLoading(true);
    // Created on submit only — see signup-form.tsx for why.
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setLoading(false);
    // Always show the same confirmation, whether or not the e-mail exists,
    // so this endpoint can't be used to enumerate registered accounts.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-in">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft">
          <MailCheck className="h-5 w-5 text-brand" />
        </div>
        <h1 className="font-display text-xl font-semibold text-ink">Verifique seu e-mail</h1>
        <p className="mt-2 text-sm text-muted">
          Se houver uma conta com esse e-mail, enviamos um link para redefinir sua senha.
        </p>
        <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-semibold text-ink">Recuperar senha</h1>
      <p className="mt-1 text-sm text-muted">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" placeholder="voce@empresa.com" />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Enviar link
        </Button>
      </form>

      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
      </Link>
    </div>
  );
}
