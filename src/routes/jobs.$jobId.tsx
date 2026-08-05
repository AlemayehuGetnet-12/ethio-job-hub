import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Briefcase,
  CalendarDays,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  daysLeft,
  formatSalary,
  getCompany,
  getJob,
  jobs,
} from "@/data/marketplace";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: ({ params }) => {
    const job = getJob(params.jobId);
    if (!job) throw notFound();
    return { job };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Job unavailable — EthioJobs Connect" }, { name: "robots", content: "noindex" }],
      };
    }
    const { job } = loaderData;
    const company = getCompany(job.companyId);
    const title = `${job.title} at ${company?.name} — EthioJobs Connect`;
    const description = `${job.employmentType} role in ${job.location}. ${formatSalary(job)}. Apply on EthioJobs Connect before ${job.deadline}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: JobDetail,
});

function JobDetail() {
  const { job } = Route.useLoaderData();
  const company = getCompany(job.companyId);
  const left = daysLeft(job.deadline);
  const related = jobs.filter((j) => j.category === job.category && j.id !== job.id).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <article>
          <div className="rounded-lg border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-md bg-secondary font-display text-lg font-bold text-secondary-foreground">
                {company?.initials}
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{job.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
                  {company?.name}
                  {company?.verified && <BadgeCheck className="size-4 text-accent" />}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">{job.employmentType}</Badge>
              <Badge variant="secondary">{job.category}</Badge>
              {job.remote && <Badge variant="secondary">Remote friendly</Badge>}
            </div>

            <Separator className="my-6" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Fact icon={MapPin} label="Location" value={job.location} />
              <Fact icon={Briefcase} label="Experience" value={job.experience} />
              <Fact icon={GraduationCap} label="Education" value={job.education} />
              <Fact icon={CalendarDays} label="Deadline" value={job.deadline} />
            </div>
          </div>

          <Section title="About the role">
            <p className="text-sm/relaxed text-muted-foreground">{job.description}</p>
          </Section>

          <Section title="Responsibilities">
            <List items={job.responsibilities} />
          </Section>

          <Section title="Requirements">
            <List items={job.requirements} />
          </Section>

          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </Section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-lg border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
            <p className="text-sm text-muted-foreground">Salary range</p>
            <p className="mt-1 font-display text-xl font-bold text-primary">{formatSalary(job)}</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="size-4" /> {job.applicants} applicants
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {left > 0 ? `Closes in ${left} days` : "Applications closed"}
            </p>
            <Button className="mt-5 w-full" size="lg">
              Apply now
            </Button>
            <Button variant="outline" className="mt-2 w-full">
              <Bookmark /> Save job
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              Applying requires a job seeker account.
            </p>
          </div>

          {company && (
            <div className="rounded-lg border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="font-display text-base font-semibold">About {company.name}</h2>
              <p className="mt-2 text-sm/relaxed text-muted-foreground">{company.about}</p>
              <dl className="mt-4 space-y-1.5 text-sm">
                <Row label="Industry" value={company.industry} />
                <Row label="Employees" value={company.employees} />
                <Row label="Location" value={company.location} />
                <Row label="Website" value={company.website} />
              </dl>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="rule-gold font-display text-xl font-bold">Similar roles</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                to="/jobs/$jobId"
                params={{ jobId: item.id }}
                className="card-elevated rounded-lg border border-border/70 p-4"
              >
                <p className="font-display text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getCompany(item.companyId)?.name} · {item.location}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm/relaxed text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
