import { Search, MessageSquareText, KanbanSquare } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Encontre",
    description: "Pesquise empresas por segmento e localização.",
  },
  {
    icon: MessageSquareText,
    title: "Aborde",
    description: "Use IA para criar mensagens personalizadas.",
  },
  {
    icon: KanbanSquare,
    title: "Venda",
    description: "Organize os contatos e acompanhe cada oportunidade no pipeline.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="border-t border-border bg-surface-raised/50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
          Como funciona
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              {i < STEPS.length - 1 && (
                <div className="absolute left-5 top-11 hidden h-px w-full translate-x-6 bg-border md:block" />
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface">
                <step.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {i + 1}. {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
