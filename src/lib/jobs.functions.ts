import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  JOB_COLUMNS,
  jobIdSchema,
  jobInputSchema,
  jobStatusSchema,
  jobUpdateSchema,
  type JobRecord,
} from "@/lib/jobs.schemas";

/** GET /employer/jobs — every job owned by the signed-in employer (drafts included). */
export const listMyJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .eq("employer_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as JobRecord[];
  });

/** GET /employer/jobs/:id — one owned job, draft or published. */
export const getMyJob = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs")
      .select(JOB_COLUMNS)
      .eq("id", data.id)
      .eq("employer_id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (job ?? null) as JobRecord | null;
  });

/** POST /employer/jobs — create a draft listing owned by the signed-in employer. */
export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs")
      .insert({
        ...data,
        deadline: data.deadline || null,
        employer_id: context.userId,
        status: "draft" as const,
      })
      .select(JOB_COLUMNS)
      .single();

    if (error) throw new Error(error.message);
    return job as JobRecord;
  });

/** PATCH /employer/jobs/:id — update an owned listing. */
export const updateJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobUpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs")
      .update({ ...data.values, deadline: data.values.deadline || null })
      .eq("id", data.id)
      .eq("employer_id", context.userId)
      .select(JOB_COLUMNS)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!job) throw new Error("Job not found");
    return job as JobRecord;
  });

/** PATCH /employer/jobs/:id/status — publish, unpublish or close a listing. */
export const setJobStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs")
      .update({
        status: data.status,
        published_at: data.status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", data.id)
      .eq("employer_id", context.userId)
      .select(JOB_COLUMNS)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!job) throw new Error("Job not found");
    return job as JobRecord;
  });

/** DELETE /employer/jobs/:id — remove an owned listing. */
export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("jobs")
      .delete()
      .eq("id", data.id)
      .eq("employer_id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
