import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  headline: z.string().trim().max(160).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  company_name: z.string().trim().max(160).optional().nullable(),
});

export type AccountProfile = {
  id: string;
  full_name: string;
  headline: string | null;
  phone: string | null;
  company_name: string | null;
};

/** GET /me — current profile plus the roles granted to the signed-in user. */
export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [{ data: profile, error: profileError }, { data: roleRows, error: roleError }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, headline, phone, company_name")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

    if (profileError) throw new Error(profileError.message);
    if (roleError) throw new Error(roleError.message);

    return {
      userId,
      profile: (profile ?? null) as AccountProfile | null,
      roles: (roleRows ?? []).map((r) => r.role as string),
    };
  });

/** PATCH /me — update the signed-in user's own profile. */
export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: saved, error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        headline: data.headline ?? null,
        phone: data.phone ?? null,
        company_name: data.company_name ?? null,
      })
      .eq("id", userId)
      .select("id, full_name, headline, phone, company_name")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return saved as AccountProfile | null;
  });
