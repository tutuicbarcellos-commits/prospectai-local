"use client";

import * as React from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const supabase = createClient();
  const [value, setValue] = React.useState(name);
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Client can only ever update its own row: RLS restricts the update
    // to where id = auth.uid(), and the query itself is written that way
    // too, defense in depth.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({ name: value })
      .eq("id", user!.id);

    setSaving(false);

    if (error) {
      toast.error("Não foi possível salvar");
      return;
    }
    toast.success("Perfil atualizado");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" value={email} disabled />
      </div>
      <Button type="submit" size="sm" loading={saving}>
        Salvar
      </Button>
    </form>
  );
}
