import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { getMyAccount, updateMyProfile } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard | EthioJobs Connect" },
      {
        name: "description",
        content:
          "Manage your EthioJobs Connect profile, account type and hiring or job search activity.",
      },
      { property: "og:title", content: "Your dashboard | EthioJobs Connect" },
      {
        property: "og:description",
        content: "Manage your EthioJobs Connect profile and account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const queryClient = useQueryClient();
  const fetchAccount = useServerFn(getMyAccount);
  const saveProfile = useServerFn(updateMyProfile);

  const account = useQuery({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
  });

  const mutation = useMutation({
    mutationFn: (values: {
      full_name: string;
      headline: string;
      phone: string;
      company_name: string;
    }) => saveProfile({ data: values }),
    onSuccess: () => {
      toast.success("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (account.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-5 py-14">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-14">
        <p className="text-sm text-destructive">
          We couldn't load your account. Please refresh and try again.
        </p>
      </div>
    );
  }

  const profile = account.data?.profile ?? null;
  const roles = account.data?.roles ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-14">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {profile?.full_name?.trim() || "Your account"}
        </h1>
        {roles.map((role) => (
          <Badge key={role} variant="secondary">
            {roleLabels[role] ?? role}
          </Badge>
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep your details current — employers see this information on your applications.
      </p>

      <form
        className="card-elevated mt-8 space-y-4 rounded-lg p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          mutation.mutate({
            full_name: String(form.get("full_name") || ""),
            headline: String(form.get("headline") || ""),
            phone: String(form.get("phone") || ""),
            company_name: String(form.get("company_name") || ""),
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile?.full_name ?? ""}
            required
            minLength={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Input
            id="headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="Frontend engineer in Addis Ababa"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company</Label>
          <Input
            id="company_name"
            name="company_name"
            defaultValue={profile?.company_name ?? ""}
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </div>
  );
}
