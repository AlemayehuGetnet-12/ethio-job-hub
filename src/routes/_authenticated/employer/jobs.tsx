import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import {
  createJob,
  deleteJob,
  listMyJobs,
  setJobStatus,
  updateJob,
} from "@/lib/jobs.functions";
import { commasToList, linesToList, type JobRecord } from "@/lib/jobs.schemas";
import { categories, employmentTypes, locations } from "@/data/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/employer/jobs")({
  head: () => ({
    meta: [
      { title: "Manage job listings | EthioJobs Connect" },
      {
        name: "description",
        content:
          "Create, edit and publish job listings for your company on EthioJobs Connect.",
      },
      { property: "og:title", content: "Manage job listings | EthioJobs Connect" },
      {
        property: "og:description",
        content: "Create, edit and publish your company's job listings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManageJobs,
});

type FormState = {
  title: string;
  company_name: string;
  location: string;
  remote: boolean;
  employment_type: string;
  category: string;
  experience: string;
  education: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  deadline: string;
  description: string;
  requirements: string;
  responsibilities: string;
  skills: string;
};

const emptyForm: FormState = {
  title: "",
  company_name: "",
  location: locations[0] ?? "Addis Ababa",
  remote: false,
  employment_type: "Full-time",
  category: categories[0]?.name ?? "",
  experience: "",
  education: "",
  salary_min: "0",
  salary_max: "0",
  currency: "ETB",
  deadline: "",
  description: "",
  requirements: "",
  responsibilities: "",
  skills: "",
};

function toForm(job: JobRecord): FormState {
  return {
    title: job.title,
    company_name: job.company_name,
    location: job.location,
    remote: job.remote,
    employment_type: job.employment_type,
    category: job.category,
    experience: job.experience,
    education: job.education,
    salary_min: String(job.salary_min),
    salary_max: String(job.salary_max),
    currency: job.currency,
    deadline: job.deadline ?? "",
    description: job.description,
    requirements: job.requirements.join("\n"),
    responsibilities: job.responsibilities.join("\n"),
    skills: job.skills.join(", "),
  };
}

function toPayload(form: FormState) {
  return {
    title: form.title,
    company_name: form.company_name,
    location: form.location,
    remote: form.remote,
    employment_type: form.employment_type as
      | "Full-time"
      | "Part-time"
      | "Contract"
      | "Internship",
    category: form.category,
    experience: form.experience,
    education: form.education,
    salary_min: Number(form.salary_min) || 0,
    salary_max: Number(form.salary_max) || 0,
    currency: form.currency || "ETB",
    deadline: form.deadline || null,
    description: form.description,
    requirements: linesToList(form.requirements),
    responsibilities: linesToList(form.responsibilities),
    skills: commasToList(form.skills),
  };
}

const statusTone: Record<JobRecord["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/10 text-primary",
  closed: "bg-destructive/10 text-destructive",
};

function ManageJobs() {
  const queryClient = useQueryClient();
  const fetchJobs = useServerFn(listMyJobs);
  const create = useServerFn(createJob);
  const update = useServerFn(updateJob);
  const publish = useServerFn(setJobStatus);
  const remove = useServerFn(deleteJob);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const jobsQuery = useQuery({ queryKey: ["my-jobs"], queryFn: () => fetchJobs() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
  const onError = (error: Error) => toast.error(error.message);

  const saveMutation = useMutation({
    mutationFn: async (values: FormState) =>
      editingId
        ? update({ data: { id: editingId, values: toPayload(values) } })
        : create({ data: toPayload(values) }),
    onSuccess: () => {
      toast.success(editingId ? "Listing updated" : "Draft created");
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError,
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: JobRecord["status"] }) =>
      publish({ data: input }),
    onSuccess: (job) => {
      toast.success(
        job.status === "published"
          ? "Listing published"
          : job.status === "closed"
            ? "Listing closed"
            : "Listing moved back to draft",
      );
      invalidate();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Listing deleted");
      setEditingId(null);
      setForm(emptyForm);
      invalidate();
    },
    onError,
  });

  const jobs = jobsQuery.data ?? [];
  const counts = useMemo(
    () => ({
      draft: jobs.filter((j) => j.status === "draft").length,
      published: jobs.filter((j) => j.status === "published").length,
      closed: jobs.filter((j) => j.status === "closed").length,
    }),
    [jobs],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="rule-gold font-display text-3xl font-bold">Manage job listings</h1>
      <p className="mt-4 text-muted-foreground">
        {counts.published} published · {counts.draft} draft · {counts.closed} closed
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <section className="space-y-4">
          {jobsQuery.isLoading && <Skeleton className="h-40 w-full" />}
          {jobsQuery.isError && (
            <p className="text-sm text-destructive">
              We couldn't load your listings. Please refresh and try again.
            </p>
          )}
          {!jobsQuery.isLoading && jobs.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="font-display font-semibold">No listings yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use the form to create your first draft, then publish it when ready.
              </p>
            </div>
          )}

          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-lg border border-border/70 bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">{job.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[job.company_name, job.location, job.employment_type]
                      .filter(Boolean)
                      .join(" · ")}
                    {job.remote ? " · Remote" : ""}
                  </p>
                </div>
                <Badge className={statusTone[job.status]} variant="secondary">
                  {job.status}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(job.id);
                    setForm(toForm(job));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Edit
                </Button>
                {job.status !== "published" ? (
                  <Button
                    size="sm"
                    disabled={statusMutation.isPending}
                    onClick={() =>
                      statusMutation.mutate({ id: job.id, status: "published" })
                    }
                  >
                    Publish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: job.id, status: "draft" })}
                  >
                    Unpublish
                  </Button>
                )}
                {job.status !== "closed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ id: job.id, status: "closed" })}
                  >
                    Close
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(job.id)}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </section>

        <aside className="rounded-lg border border-border/70 bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">
            {editingId ? "Edit listing" : "New listing"}
          </h2>

          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate(form);
            }}
          >
            <Field label="Job title" htmlFor="title">
              <Input
                id="title"
                required
                minLength={3}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>

            <Field label="Company" htmlFor="company">
              <Input
                id="company"
                value={form.company_name}
                onChange={(e) => set("company_name", e.target.value)}
              />
            </Field>

            <Field label="Category" htmlFor="category">
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Location" htmlFor="location">
              <Select value={form.location} onValueChange={(v) => set("location", v)}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Employment type" htmlFor="type">
              <Select
                value={form.employment_type}
                onValueChange={(v) => set("employment_type", v)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-center justify-between">
              <Label htmlFor="remote-toggle">Remote friendly</Label>
              <Switch
                id="remote-toggle"
                checked={form.remote}
                onCheckedChange={(v) => set("remote", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Salary min" htmlFor="min">
                <Input
                  id="min"
                  type="number"
                  min={0}
                  value={form.salary_min}
                  onChange={(e) => set("salary_min", e.target.value)}
                />
              </Field>
              <Field label="Salary max" htmlFor="max">
                <Input
                  id="max"
                  type="number"
                  min={0}
                  value={form.salary_max}
                  onChange={(e) => set("salary_max", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience" htmlFor="experience">
                <Input
                  id="experience"
                  placeholder="3+ years"
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                />
              </Field>
              <Field label="Education" htmlFor="education">
                <Input
                  id="education"
                  placeholder="BSc"
                  value={form.education}
                  onChange={(e) => set("education", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Application deadline" htmlFor="deadline">
              <Input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </Field>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>

            <Field label="Requirements (one per line)" htmlFor="requirements">
              <Textarea
                id="requirements"
                rows={3}
                value={form.requirements}
                onChange={(e) => set("requirements", e.target.value)}
              />
            </Field>

            <Field label="Responsibilities (one per line)" htmlFor="responsibilities">
              <Textarea
                id="responsibilities"
                rows={3}
                value={form.responsibilities}
                onChange={(e) => set("responsibilities", e.target.value)}
              />
            </Field>

            <Field label="Skills (comma separated)" htmlFor="skills">
              <Input
                id="skills"
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
              />
            </Field>

            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                {editingId ? "Save changes" : "Create draft"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
