import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Writes an audit trail entry for a sensitive action. Metadata must never
 * contain secrets, tokens, or passwords — only small, non-sensitive
 * context (e.g. a lead id or a plan name) useful for later review.
 */
export async function logAudit(
  supabase: SupabaseClient,
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await supabase
    .from("audit_logs")
    .insert({ user_id: userId, action, metadata });

  if (error) {
    // Auditing must never break the primary request flow.
    console.error("[audit-log] failed to write entry", action, error.message);
  }
}
