import {
  Search,
  BarChart3,
  Sparkles,
  KanbanSquare,
  History,
  LayoutDashboard,
  TrendingUp,
  FolderKanban,
} from "lucide-react";

const FEATURES = [
  { icon: Search, title: "Pesquisa de empresas", description: "Busque por categoria e localização, do bairro à cidade." },
  { icon: BarChart3, title: "Análise de oportunidades", description: "Veja o que dá para melhorar na presença online de cada empresa." },
  { icon: Sparkles, title: "IA para mensagens", description: "Gere abordagens curtas e naturais para WhatsApp em segundos." },
  { icon: KanbanSquare, title: "Pipeline de vendas", description: "Acompanhe cada lead do primeiro contato até o fechamento." },
  { icon: History, title: "Histórico de contatos", description: "Cada interação registrada na linha do tempo do lead." },
  { icon: LayoutDashboard, title: "Dashboard", description: "Uma visão clara do que fazer a seguir, todos os dias." },
  { icon: TrendingUp, title: "Estatísticas", description: "Taxa de conversão, valor potencial e evolução do funil." },
  { icon: FolderKanban, title: "Organização de leads", description: "Status, valor de proposta e próxima ação sempre à mão." },
];

export function Features() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
        Tudo que você precisa para prospectar
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Um único lugar para encontrar, abordar e acompanhar clientes em potencial.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-border bg-surface p-5"
          >
            <feature.icon className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-sm font-semibold text-ink">{feature.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
