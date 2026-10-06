import Link from "next/link";
import { Radar, Check } from "lucide-react";

const PILLS = ["Tudo em um painel", "Sem instalar nada", "Funciona em qualquer lugar"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-[440px] lg:flex-none">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
            <Radar className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-semibold text-ink">
            ProspectAI Local
          </span>
        </Link>
        {children}
      </div>

      <div className="relative hidden flex-1 items-center justify-center bg-surface-raised lg:flex">
        <div className="w-full max-w-md px-10">
          <div className="mb-5 flex flex-wrap gap-2">
            {PILLS.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted"
              >
                <Check className="h-3 w-3 text-brand" /> {pill}
              </span>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-popover">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Seu pipeline hoje</span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                +4 novos
              </span>
            </div>
            <ul className="space-y-2.5">
              {[
                { name: "Cantina Bella Vista", status: "Novo" },
                { name: "Studio Vitta Hair", status: "Contatado" },
                { name: "Auto Center Silva", status: "Proposta" },
              ].map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm text-ink">{item.name}</span>
                  <span className="text-xs text-muted">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 font-display text-xl font-medium leading-snug text-ink">
            &ldquo;Consigo achar oportunidades e mandar a primeira mensagem em
            minutos, não em horas.&rdquo;
          </p>
          <p className="mt-2 text-sm text-muted">
            Desenvolvedor freelancer usando o ProspectAI Local para prospectar clientes locais.
          </p>
        </div>
      </div>
    </div>
  );
}
