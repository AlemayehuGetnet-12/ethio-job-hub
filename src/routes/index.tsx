import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Search, ShieldCheck, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-professionals.jpg";
import { JobCard } from "@/components/job-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories, companies, jobs } from "@/data/marketplace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EthioJobs Connect — Ethiopian Job Marketplace" },
      {
        name: "description",
        content:
          "Find verified jobs across Ethiopia and hire faster. Browse openings in tech, banking, health, engineering and more on EthioJobs Connect.",
      },
      { property: "og:title", content: "EthioJobs Connect — Ethiopian Job Marketplace" },
      {
        property: "og:description",
        content:
          "Find verified jobs across Ethiopia and hire faster. Browse openings in tech, banking, health, engineering and more.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = jobs.slice(0, 4);

  return (
    <div>
      <section className="surface-canopy">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div>
            <Badge className="border-transparent bg-accent text-accent-foreground hover:bg-accent">
              1,240 open roles this week
            </Badge>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
              Ethiopian talent, <span className="text-accent">verified employers</span>, one
              marketplace.
            </h1>
            <p className="mt-5 max-w-xl text-base/relaxed text-primary-foreground/80">
              Search openings in Addis Ababa, Adama, Bahir Dar, Hawassa and beyond. Every employer
              on EthioJobs Connect is reviewed before a job goes live.
            </p>

            <form
              className="mt-8 flex flex-col gap-3 rounded-lg bg-card p-3 shadow-lg sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Job title, skill or company"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                  aria-label="Search jobs"
                />
              </div>
              <Button size="lg" asChild>
                <Link to="/jobs">Search jobs</Link>
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Software & IT", "Banking & Finance", "NGO & Development", "Remote"].map((tag) => (
                <Link
                  key={tag}
                  to="/jobs"
                  className="rounded-full border border-primary-foreground/25 px-3 py-1 text-xs font-medium text-primary-foreground/85 transition-colors hover:border-accent hover:text-accent"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="Ethiopian professionals collaborating in a modern Addis Ababa office"
              width={1400}
              height={1000}
              className="w-full rounded-xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-5 left-5 rounded-lg bg-card px-4 py-3 shadow-lg">
              <p className="font-display text-xl font-bold text-primary">6,800+</p>
              <p className="text-xs text-muted-foreground">candidates hired since 2023</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="rule-gold font-display text-2xl font-bold">Browse by category</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/jobs"
              className="card-elevated rounded-lg border border-border/70 p-4"
            >
              <p className="font-display text-sm font-semibold">{cat.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{cat.count} open roles</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="rule-gold font-display text-2xl font-bold">Featured openings</h2>
          <Button variant="outline" asChild>
            <Link to="/jobs">
              View all jobs <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {featured.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/50">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Verified employers only",
              body: "Every company profile is checked by our team before a job listing is published.",
            },
            {
              icon: Sparkles,
              title: "One profile, many applications",
              body: "Build a professional profile once, then apply to any role in a couple of clicks.",
            },
            {
              icon: BadgeCheck,
              title: "Transparent salaries",
              body: "Listings show salary ranges in ETB so you know what a role pays before applying.",
            },
          ].map((item) => (
            <div key={item.title}>
              <item.icon className="size-6 text-primary" />
              <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm/relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="rule-gold font-display text-2xl font-bold">Hiring companies</h2>
          <Button variant="outline" asChild>
            <Link to="/companies">
              All companies <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.slice(0, 6).map((company) => (
            <Link
              key={company.id}
              to="/companies"
              className="card-elevated flex items-center gap-3 rounded-lg border border-border/70 p-4"
            >
              <span className="grid size-11 place-items-center rounded-md bg-secondary font-display text-sm font-bold text-secondary-foreground">
                {company.initials}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-display text-sm font-semibold">
                    {company.name}
                  </span>
                  {company.verified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {company.industry}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
