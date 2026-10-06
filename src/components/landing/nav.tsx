"use client";

import Link from "next/link";
import { Radar } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
            <Radar className="h-4 w-4" />
          </div>
          <span className="font-display text-sm font-semibold text-ink">ProspectAI Local</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <a href="#como-funciona" className="hover:text-ink">Como funciona</a>
          <a href="#recursos" className="hover:text-ink">Recursos</a>
          <a href="#precos" className="hover:text-ink">Preços</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="hidden text-sm font-medium text-muted hover:text-ink sm:block">
            Entrar
          </Link>
          <Link href="/cadastro">
            <Button size="sm">Começar gratuitamente</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
