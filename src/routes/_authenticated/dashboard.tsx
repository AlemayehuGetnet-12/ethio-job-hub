import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusiness, ShieldCheck, UserRound } from "lucide-react";
import { getMyAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — EthioJobs Connect" },
      {
        name: "description",
        content:
          "Manage your EthioJobs Connect account, applications and job postings from one dashboard.",
      },
      { property: "og:title", content: "Your dashboard — EthioJobs Connect" },
      {
        property: "og:description",
        content: "Manage your applications, postings and account on EthioJobs Connect.",
      },
    ],
  }),
  component: Dashboard,
});

const roleLabels: Record<string, string> = {
  job_seeker: "Job seeker",
  employer: "Employer",
  admin: "Administrator",
};

function Dashboard() {
  const fetchAccount = useServerFn(getMyAccount);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["my-account"],
    queryFn: () => fetchAccount(),
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  const roles = data?.roles ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {data?.profile?.full_name || "Your dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {roleLabels[role] ?? role}
              </Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </div>

      {isPending ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading your account…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-destructive">We couldn't load your account.</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {roles.includes("job_seeker") && (
            <section className="card-elevated rounded-xl border border-border p-6">
              <UserRound className="size-6 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">Job seeker workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Track applications and saved roles. Start by browsing verified openings.
              </p>
              <Button className="mt-4" size="sm" asChild>
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            </section>
          )}

          {roles.includes("employer") && (
            <section className="card-elevated rounded-xl border border-border p-6">
              <BriefcaseBusiness className="size-6 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">Employer workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.profile?.company_name
                  ? `Hiring for ${data.profile.company_name}.`
                  : "Add your company details to start posting roles."}
              </p>
              <Button className="mt-4" size="sm" asChild>
                <Link to="/companies">View employers</Link>
              </Button>
            </section>
          )}

          {roles.includes("admin") && (
            <section className="card-elevated rounded-xl border border-border p-6">
              <ShieldCheck className="size-6 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">Admin controls</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Moderate users, employers and job listings across the marketplace.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
