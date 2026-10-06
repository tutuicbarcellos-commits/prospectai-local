import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeadHeader } from "@/components/leads/lead-header";
import { LeadInfoCard } from "@/components/leads/lead-info-card";
import { LeadNotesCard } from "@/components/leads/lead-notes-card";
import { AIAnalysis } from "@/components/leads/ai-analysis";
import { MessageGenerator } from "@/components/leads/message-generator";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import type { Lead, Interaction } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Scoped by user_id in addition to RLS: a lead belonging to another
  // user simply won't be found here — see Test 1 in the security checklist.
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!lead) {
    notFound();
  }

  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("lead_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <LeadHeader lead={lead as Lead} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <LeadInfoCard lead={lead as Lead} />
          <LeadNotesCard lead={lead as Lead} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <AIAnalysis leadId={lead.id} existingOpportunity={lead.opportunity} />
          <MessageGenerator leadId={lead.id} />
          <ActivityTimeline leadId={lead.id} interactions={(interactions ?? []) as Interaction[]} />
        </div>
      </div>
    </div>
  );
}
