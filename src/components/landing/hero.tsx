import Link from "next/link";
import { ArrowRight, PlayCircle, Flame, Thermometer, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";

const PREVIEW_LEADS = [
  { name: "Cantina Bella Vista", meta: "Restaurante · Cidade Baixa", temp: "quente" as const, tag: "Sem site" },
  { name: "Studio Vitta Hair", meta: "Salão · Moinhos de Vento", temp: "morno" as const, tag: "Sem Instagram ativo" },
  { name: "Oficina Prado", meta: "Oficina · Partenon", temp: "frio" as const, tag: "Avaliação 3.2" },
];

const TEMP_STYLES = {
  quente: { icon: Flame, label: "Quente", className: "bg-danger-soft text-danger" },
  morno: { icon: Thermometer, label: "Morno", className: "bg-amber-soft text-amber" },
  frio: { icon: Snowflake, label: "Frio", className: "bg-surface-raised text-muted" },
};

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex items-center rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted">
            Feito para freelancers, agências e pequenos negócios
          </div>
          <h1 className="font-display text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-[2.75rem]">
            Encontre clientes. Organize seus leads. Venda mais.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Encontre empresas, descubra oportunidades e gere abordagens
            personalizadas em um único lugar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/cadastro">
              <Button size="lg">
                Começar gratuitamente <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="outline">
                <PlayCircle className="h-4 w-4" /> Ver como funciona
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-muted">
            Plano gratuito com 20 leads e 10 gerações de IA por mês. Sem cartão de crédito.
          </p>
        </div>

        {/* Product glimpse, in the spirit of LeadSite's dashboard preview:
            a short lead list with a "temperature" read on each opportunity. */}
        <div className="relative">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-popover">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Prospecção — Porto Alegre</span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                3 novos
              </span>
            </div>

            <div className="space-y-2">
              {PREVIEW_LEADS.map((lead) => {
                const temp = TEMP_STYLES[lead.temp];
                return (
                  <div key={lead.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-ink">{lead.name}</p>
                        <p className="text-xs text-muted">{lead.meta}</p>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${temp.className}`}>
                        <temp.icon className="h-3 w-3" /> {temp.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">{lead.tag}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-md bg-surface-raised p-3 text-xs leading-relaxed text-ink">
              &ldquo;Oi! Tudo bem? Vi a Cantina Bella Vista pelo Google e trabalho
              com sites para restaurantes locais. Tive uma ideia rápida
              pra ajudar na presença online de vocês — posso te mostrar?&rdquo;
            </div>
            <Button size="sm" className="mt-3 w-full">
              Adicionar ao pipeline
            </Button>
          </div>

          <div className="absolute -bottom-5 -right-5 hidden items-center gap-1.5 rotate-2 rounded-lg border border-border bg-surface px-4 py-3 shadow-popover sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <div>
              <p className="text-xs font-medium text-muted">Status do lead</p>
              <p className="font-display text-sm font-semibold text-ink">Em negociação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
