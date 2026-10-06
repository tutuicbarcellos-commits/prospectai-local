const HIGHLIGHTS = [
  { value: "20", label: "leads grátis por mês, pra começar" },
  { value: "< 1 min", label: "para gerar uma abordagem com IA" },
  { value: "6", label: "etapas de pipeline, do novo ao fechado" },
  { value: "0", label: "cartão de crédito pra testar" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <div key={item.label}>
            <p className="font-display text-2xl font-semibold text-brand md:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs leading-snug text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
