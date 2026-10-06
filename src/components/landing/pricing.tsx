import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "R$0",
    description: "Para testar a plataforma",
    features: ["20 leads por mês", "Pipeline básico", "10 gerações de IA por mês"],
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "R$29",
    description: "Para quem prospecta com regularidade",
    features: [
      "200 leads por mês",
      "Pipeline completo",
      "100 gerações de IA",
      "Análise de empresas",
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$59",
    description: "Para quem vive de prospecção",
    features: [
      "1.000 leads por mês",
      "IA avançada",
      "Análise de oportunidades",
      "Histórico completo",
      "Mais automações",
    ],
    highlighted: false,
  },
  {
    id: "agency",
    name: "Agency",
    price: "R$99",
    description: "Para agências e times",
    features: [
      "3.000 leads por mês",
      "Recursos avançados",
      "Mais usuários (em breve)",
      "Prioridade no suporte",
    ],
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="precos" className="border-t border-border bg-surface-raised/50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
          Preços simples, sem surpresas
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Comece de graça e faça upgrade quando precisar de mais volume.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-lg border bg-surface p-6",
                plan.highlighted ? "border-brand shadow-popover" : "border-border"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-md bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                  Mais popular
                </span>
              )}
              <h3 className="font-display text-base font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1 text-xs text-muted">{plan.description}</p>
              <p className="mt-4 font-display text-3xl font-medium text-ink">
                {plan.price}
                <span className="text-sm font-normal text-muted">/mês</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="mt-6">
                <Button variant={plan.highlighted ? "primary" : "outline"} className="w-full">
                  {plan.id === "free" ? "Começar grátis" : "Assinar"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          Pagamentos via Stripe ou Mercado Pago — em breve. Por enquanto, todas as contas
          começam no plano Free e o upgrade é feito diretamente com nosso time.
        </p>
      </div>
    </section>
  );
}
