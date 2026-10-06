"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setErrors(Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ));
      return;
    }

    setLoading(true);
    // Created on submit only — see signup-form.tsx for why.
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível redefinir a senha", { description: error.message });
      return;
    }

    toast.success("Senha atualizada com sucesso");
    router.replace("/dashboard");
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-xl font-semibold text-ink">Definir nova senha</h1>
      <p className="mt-1 text-sm text-muted">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">Nova senha</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" />
          <FieldError>{errors.password}</FieldError>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
          <FieldError>{errors.confirmPassword}</FieldError>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Salvar nova senha
        </Button>
      </form>
    </div>
  );
}
