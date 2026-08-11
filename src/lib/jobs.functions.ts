import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const JOB_COLUMNS =
  "id, employer_id, title, company_name, location, remote, employment_type, category, experience, education, salary_min, salary_max, currency, deadline, description, requirements, responsibilities, skills, status, published_at, created_at, updated_at";

const listSchema = z.object({
  text: z.string().trim().max(600).optional().nullable(),
});

const jobInputSchema = z.object({
  title: z.string().trim().min(3).max(140),
  company_name: z.string().trim().max(160).default(""),
  location: z.string().trim().max(160).default(""),
  remote: z.boolean().default(false),
  employment_type: z
    .enum(["Full-time", "Part-time", "Contract", "Internship"])
    .default("Full-time"),
  category: z.string().trim().max(120).default(""),
  experience: z.string().trim().max(120).default(""),
  education: z.string().trim().max(120).default(""),
  salary_min: z.number().int().min(0).max(100_000_000).default(0),
  salary_max: z.number().int().min(0).max(100_000_000).default(0),
  currency: z.string().trim().max(10).default("ETB"),
  deadline: z.string().trim().max(40).optional().nullable(),
  description: z.string().trim().max(8000).default(""),
  requirements: z.array(z.string().trim().max(400)).max(30).default([]),
  responsibilities: z.array(z.string().trim().max(400)).max(30).default([]),
  skills: z.array(z.string().trim().max(60)).max(30).default([]),
});

const createSchema = jobInputSchema;
const updateSchema = z.object({ id: z.string().uuid(), values: jobInputSchema });
const idSchema = z.object({ id: z.string().uuid() });
const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published", "closed"]),
});

export type JobRecord = {
  id: string;
  employer_id: string;
  title: string;
  company_name: string;
  location: string;
  remote: boolean;
  employment_type: string;
  category: string;
  experience: string;
  education: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  deadline: string | null;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  status: "draft" | "published" | "closed";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

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
  .inputValidator((input: unknown) => idSchema.parse(input))
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
  .inputValidator((input: unknown) => createSchema.parse(input))
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
  .inputValidator((input: unknown) => updateSchema.parse(input))
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
  .inputValidator((input: unknown) => statusSchema.parse(input))
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

/** DELETE /employer/jobs/:id */
export const deleteJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("jobs")
      .delete()
      .eq("id", data.id)
      .eq("employer_id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const parseList = (value: string) =>
  listSchema.parse({ text: value }).text
    ?.split("\n")
    .map((line) => line.trim())
    .filter(Boolean) ?? [];
