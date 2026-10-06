"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { createLeadSchema } from "@/lib/validations/lead";

const CATEGORIES = [
  "Dentistas", "Clínicas", "Restaurantes", "Academias", "Oficinas",
  "Imobiliárias", "Barbearias", "Salões", "Pet shops", "Lojas", "Outros",
];

export function LeadForm({
  onCreated,
  defaultValues,
}: {
  onCreated?: (leadId: string) => void;
  defaultValues?: Partial<{ company_name: string; category: string; address: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());
    const parsed = createLeadSchema.safeParse({
      ...raw,
      rating: raw.rating || undefined,
      estimated_value: raw.estimated_value || undefined,
    });

    if (!parsed.success) {
      setErrors(Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] ?? ""])
      ));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível adicionar o lead", { description: data.error });
      return;
    }

    const { lead } = await res.json();
    toast.success(`"${lead.company_name}" adicionado ao pipeline`);
    e.currentTarget.reset();
    if (onCreated) onCreated(lead.id);
    else router.push(`/leads/${lead.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="company_name">Nome da empresa</Label>
          <Input
            id="company_name"
            name="company_name"
            required
            defaultValue={defaultValues?.company_name}
            placeholder="Ex: Cantina Bella Vista"
          />
          <FieldError>{errors.company_name}</FieldError>
        </div>
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            list="categories"
            defaultValue={defaultValues?.category}
            placeholder="Ex: Restaurantes"
          />
          <datalist id="categories">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
          <FieldError>{errors.category}</FieldError>
        </div>
        <div>
          <Label htmlFor="address">Endereço / bairro</Label>
          <Input id="address" name="address" defaultValue={defaultValues?.address} placeholder="Cidade Baixa, Porto Alegre" />
          <FieldError>{errors.address}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" placeholder="(51) 99999-0000" />
          <FieldError>{errors.phone}</FieldError>
        </div>
        <div>
          <Label htmlFor="website">Site</Label>
          <Input id="website" name="website" placeholder="https://" />
          <FieldError>{errors.website}</FieldError>
        </div>
        <div>
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" placeholder="@empresa" />
          <FieldError>{errors.instagram}</FieldError>
        </div>
        <div>
          <Label htmlFor="rating">Avaliação (0 a 5)</Label>
          <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" />
          <FieldError>{errors.rating}</FieldError>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="estimated_value">Valor potencial estimado (R$)</Label>
          <Input id="estimated_value" name="estimated_value" type="number" step="1" min="0" />
          <FieldError>{errors.estimated_value}</FieldError>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="Qualquer contexto útil sobre esse lead" />
          <FieldError>{errors.notes}</FieldError>
        </div>
      </div>
      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Adicionar ao pipeline
      </Button>
    </form>
  );
}
