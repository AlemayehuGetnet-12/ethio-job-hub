import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { daysLeft, formatSalary, getCompany, type Job } from "@/data/marketplace";

export function JobCard({ job }: { job: Job }) {
  const company = getCompany(job.companyId);
  const left = daysLeft(job.deadline);

  return (
    <Link
      to="/jobs/$jobId"
      params={{ jobId: job.id }}
      className="card-elevated block rounded-lg border border-border/70 p-5"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-secondary font-display text-sm font-bold text-secondary-foreground">
          {company?.initials}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-semibold">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="truncate">{company?.name}</span>
            {company?.verified && <BadgeCheck className="size-4 shrink-0 text-accent" />}
          </p>
        </div>
        <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
          {job.employmentType}
        </Badge>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4" />
          {job.location}
          {job.remote && " · Remote"}
        </span>
        <span className="font-medium text-primary">{formatSalary(job)}</span>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {left > 0 ? `${left} days left` : "Closed"}
        </span>
      </div>
    </Link>
  );
}
