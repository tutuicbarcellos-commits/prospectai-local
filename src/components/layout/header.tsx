"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Radar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, initials } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prospeccao", label: "Prospecção" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/assistente", label: "Assistente IA" },
  { href: "/configuracoes", label: "Configurações" },
];

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/prospeccao": "Prospecção",
  "/pipeline": "Pipeline",
  "/assistente": "Assistente IA",
  "/configuracoes": "Configurações",
};

export function Header({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const title =
    Object.entries(PAGE_TITLES).find(([href]) => pathname.startsWith(href))?.[1] ?? "";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/80 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="focus-ring flex h-8 w-8 items-center justify-center rounded-md text-ink lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <h1 className="font-display text-sm font-semibold text-ink lg:text-base">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2 border-l border-border pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
            {initials(userName || "U")}
          </div>
          <button
            onClick={handleLogout}
            className="focus-ring hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-surface-raised hover:text-ink sm:flex"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-14 z-20 border-b border-border bg-surface p-3 lg:hidden">
          <div className="mb-2 flex items-center gap-2 px-2 py-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white">
              <Radar className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-sm font-semibold text-ink">ProspectAI Local</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname.startsWith(item.href)
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-surface-raised hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface-raised hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      )}
    </header>
  );
}
