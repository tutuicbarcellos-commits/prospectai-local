"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  KanbanSquare,
  Sparkles,
  Settings,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prospeccao", label: "Prospecção", icon: Search },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/assistente", label: "Assistente IA", icon: Sparkles },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
          <Radar className="h-4 w-4" />
        </div>
        <span className="font-display text-sm font-semibold text-ink">ProspectAI Local</span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-surface-raised hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-md bg-surface-raised px-3 py-3">
          <p className="text-xs font-medium text-ink">Plano Free</p>
          <p className="mt-0.5 text-xs text-muted">20 leads e 10 gerações de IA por mês</p>
          <Link
            href="/configuracoes"
            className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
          >
            Fazer upgrade
          </Link>
        </div>
      </div>
    </aside>
  );
}
