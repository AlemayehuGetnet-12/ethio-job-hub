import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchSchema = z.object({
  verify: z.boolean().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in or create an account — EthioJobs Connect" },
      {
        name: "description",
        content:
          "Sign in to EthioJobs Connect as a job seeker or employer, or create a verified account to apply and hire.",
      },
      { property: "og:title", content: "Sign in or create an account — EthioJobs Connect" },
      {
        property: "og:description",
        content: "Secure sign in for job seekers and employers on EthioJobs Connect.",
      },
    ],
  }),
  component: AuthPage,
});

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState<string | null>(null);
  const [role, setRole] = useState<"job_seeker" | "employer">("job_seeker");

  const destination = search.redirect?.startsWith("/") ? search.redirect : "/dashboard";

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signUpSchema.safeParse({
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          role,
          company_name: role === "employer" ? String(form.get("companyName") ?? "") : null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setPendingVerification(parsed.data.email);
      return;
    }
    void navigate({ to: destination });
  }

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = signInSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.user?.email_confirmed_at) {
      setPendingVerification(parsed.data.email);
      return;
    }
    toast.success("Welcome back");
    void navigate({ to: destination });
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: destination });
  }

  async function resendVerification(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
    else toast.success("Verification email sent again");
  }

  async function handleForgotPassword(email: string) {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent");
  }

  if (pendingVerification || search.verify) {
    const email = pendingVerification ?? "";
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center">
        <MailCheck className="size-10 text-accent" />
        <h1 className="mt-4 font-display text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification link{email ? ` to ${email}` : ""}. Confirm your address to unlock
          your dashboard, applications and job posting.
        </p>
        {email ? (
          <Button variant="outline" className="mt-6" onClick={() => void resendVerification(email)}>
            Resend verification email
          </Button>
        ) : null}
        <Button variant="ghost" className="mt-2" onClick={() => setPendingVerification(null)} asChild={false}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome to EthioJobs Connect</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One account for job seekers, employers and administrators.
      </p>

      <Tabs defaultValue="signin" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Sign in
            </Button>
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => {
                const el = document.getElementById("signin-email") as HTMLInputElement | null;
                void handleForgotPassword(el?.value.trim() ?? "");
              }}
            >
              Forgot your password?
            </button>
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("job_seeker")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  role === "job_seeker"
                    ? "border-primary bg-secondary text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                Job seeker
              </button>
              <button
                type="button"
                onClick={() => setRole("employer")}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  role === "employer"
                    ? "border-primary bg-secondary text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                Employer
              </button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full name</Label>
              <Input id="signup-name" name="fullName" required maxLength={100} />
            </div>
            {role === "employer" ? (
              <div className="space-y-2">
                <Label htmlFor="signup-company">Company name</Label>
                <Input id="signup-company" name="companyName" maxLength={120} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="w-full" onClick={() => void handleGoogle()}>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our terms. Browse jobs anytime as a guest on the{" "}
        <Link to="/jobs" className="underline">
          job board
        </Link>
        .
      </p>
    </div>
  );
}
