import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * JWT-protected account read: the bearer token is validated server-side by
 * requireSupabaseAuth before any data is touched, and RLS applies as the user.
 */
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, headline, phone, company_name, created_at")
      .eq("id", userId)
      .maybeSingle();

    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const claimRecord = claims as unknown as Record<string, unknown>;

    return {
      userId,
      email: typeof claimRecord["email"] === "string" ? (claimRecord["email"] as string) : null,
      profile: profile ?? null,
      roles: (roleRows ?? []).map((row) => row.role as string),
    };
  });
