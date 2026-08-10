import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Sign in or create an account | EthioJobs Connect" },
      {
        name: "description",
        content:
          "Sign in to EthioJobs Connect to apply for jobs, or create an employer account to post openings across Ethiopia.",
      },
      { property: "og:title", content: "Sign in | EthioJobs Connect" },
      {
        property: "og:description",
        content: "Access your EthioJobs Connect job seeker or employer account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const role = String(form.get("role") || "job_seeker");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: String(form.get("full_name") || ""),
          phone: String(form.get("phone") || ""),
          company_name: String(form.get("company_name") || ""),
          role,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      toast.success("Check your email to confirm your account");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-14">
      <div className="mb-8 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Welcome to EthioJobs Connect
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to apply for jobs, or register as an employer to start hiring.
        </p>
      </div>

      {checkEmail ? (
        <div className="card-elevated rounded-lg p-6 text-center">
          <h2 className="font-display text-lg font-semibold">Confirm your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent you a confirmation link. Click it to activate your account, then come
            back and sign in.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setCheckEmail(false)}>
            Back to sign in
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="card-elevated space-y-4 rounded-lg p-6">
              <div className="space-y-2">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="si-password">Password</Label>
                <Input
                  id="si-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="card-elevated space-y-4 rounded-lg p-6">
              <div className="space-y-2">
                <Label htmlFor="su-name">Full name</Label>
                <Input id="su-name" name="full_name" required minLength={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-role">I am a</Label>
                <Select name="role" defaultValue="job_seeker">
                  <SelectTrigger id="su-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_seeker">Job seeker</SelectItem>
                    <SelectItem value="employer">Employer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-company">Company (employers only)</Label>
                <Input id="su-company" name="company_name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-phone">Phone</Label>
                <Input id="su-phone" name="phone" type="tel" placeholder="+251…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/jobs" className="underline underline-offset-4 hover:text-foreground">
          Continue browsing jobs
        </Link>
      </p>
    </div>
  );
}
