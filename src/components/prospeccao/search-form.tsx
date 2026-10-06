"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const CATEGORIES = [
  "Dentistas", "Clínicas", "Restaurantes", "Academias", "Oficinas",
  "Imobiliárias", "Barbearias", "Salões", "Pet shops", "Lojas", "Outros",
];

export function SearchForm({
  onSearch,
  loading,
}: {
  onSearch: (category: string, location: string) => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSearch(String(formData.get("category") ?? ""), String(formData.get("location") ?? ""));
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor="category">Categoria</Label>
        <Input id="category" name="category" list="categories" placeholder="Ex: Restaurantes" required />
        <datalist id="categories">
          {CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="flex-1">
        <Label htmlFor="location">Localização</Label>
        <Input id="location" name="location" placeholder="Ex: Porto Alegre" required />
      </div>
      <Button type="submit" loading={loading} className="sm:mb-0">
        <Search className="h-4 w-4" /> Pesquisar
      </Button>
    </form>
  );
}
