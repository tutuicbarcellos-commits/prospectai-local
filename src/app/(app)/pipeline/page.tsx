import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { EmptyState } from "@/components/ui/empty-state";
import { KanbanSquare } from "lucide-react";
import type { Lead } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const allLeads = (leads ?? []) as Lead[];

  if (allLeads.length === 0) {
    return (
      <EmptyState
        icon={KanbanSquare}
        title="Seu pipeline está vazio"
        description="Adicione leads pela Prospecção ou diretamente aqui para começar a organizar suas vendas."
      />
    );
  }

  return <KanbanBoard initialLeads={allLeads} />;
}
