import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface NextAction {
  id: string;
  company_name: string;
  next_action: string | null;
  next_action_date: string | null;
}

export function NextActions({ leads }: { leads: NextAction[] }) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nenhuma ação pendente"
        description="Defina uma próxima ação nos leads do seu pipeline para vê-las aqui."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {leads.map((lead) => (
        <li key={lead.id}>
          <Link
            href={`/leads/${lead.id}`}
            className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:bg-surface-raised"
          >
            <div>
              <p className="font-medium text-ink">{lead.next_action}</p>
              <p className="text-xs text-muted">{lead.company_name}</p>
            </div>
            {lead.next_action_date && (
              <span className="shrink-0 text-xs text-muted">
                {formatDate(lead.next_action_date)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
