import Link from "next/link";
import { Radar } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white">
            <Radar className="h-3.5 w-3.5" />
          </div>
          <span className="font-display text-sm font-semibold text-ink">ProspectAI Local</span>
        </div>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} ProspectAI Local. Prospecção comercial para quem
          vende para negócios locais.
        </p>
        <div className="flex gap-5 text-xs text-muted">
          <Link href="/login" className="hover:text-ink">Entrar</Link>
          <Link href="/cadastro" className="hover:text-ink">Criar conta</Link>
        </div>
      </div>
    </footer>
  );
}
