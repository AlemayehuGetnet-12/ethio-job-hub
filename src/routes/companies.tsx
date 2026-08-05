import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Globe, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { companies, jobs } from "@/data/marketplace";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies Hiring in Ethiopia — EthioJobs Connect" },
      {
        name: "description",
        content:
          "Explore verified Ethiopian employers hiring now, from banks and hospitals to tech studios and logistics firms.",
      },
      { property: "og:title", content: "Companies Hiring in Ethiopia — EthioJobs Connect" },
      {
        property: "og:description",
        content: "Explore verified Ethiopian employers hiring now across every major industry.",
      },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="rule-gold font-display text-3xl font-bold">Companies</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Employers listed here have submitted trade licence details for review. A gold check means
        verification is complete.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {companies.map((company) => {
          const openRoles = jobs.filter((j) => j.companyId === company.id).length;
          return (
            <div
              key={company.id}
              className="card-elevated rounded-lg border border-border/70 p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-secondary font-display text-base font-bold text-secondary-foreground">
                  {company.initials}
                </span>
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5 font-display text-lg font-semibold">
                    <span className="truncate">{company.name}</span>
                    {company.verified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
                  </h2>
                  <Badge variant="secondary" className="mt-1.5">
                    {company.industry}
                  </Badge>
                </div>
              </div>

              <p className="mt-4 text-sm/relaxed text-muted-foreground">{company.about}</p>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> {company.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" /> {company.employees}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="size-4" /> {company.website}
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-medium text-primary">
                  {openRoles} open role{openRoles === 1 ? "" : "s"}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/jobs">View jobs</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
