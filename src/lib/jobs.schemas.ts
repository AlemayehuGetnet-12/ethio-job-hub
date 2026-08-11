import { z } from "zod";

export const JOB_COLUMNS =
  "id, employer_id, title, company_name, location, remote, employment_type, category, experience, education, salary_min, salary_max, currency, deadline, description, requirements, responsibilities, skills, status, published_at, created_at, updated_at";

export const jobInputSchema = z.object({
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

export const jobUpdateSchema = z.object({
  id: z.string().uuid(),
  values: jobInputSchema,
});
export const jobIdSchema = z.object({ id: z.string().uuid() });
export const jobStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "published", "closed"]),
});

export type JobInput = z.infer<typeof jobInputSchema>;

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

/** Turn a textarea value into a trimmed list of bullet lines. */
export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Turn a comma-separated value into a trimmed list. */
export function commasToList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
