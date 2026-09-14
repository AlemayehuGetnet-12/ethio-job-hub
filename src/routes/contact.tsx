import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact EthioJobs Connect — Support & Sales" },
      {
        name: "description",
        content:
          "Get in touch with the EthioJobs Connect team in Addis Ababa for support, employer onboarding or partnership enquiries.",
      },
      { property: "og:title", content: "Contact EthioJobs Connect — Support & Sales" },
      {
        property: "og:description",
        content: "Reach our Addis Ababa team for support, employer onboarding or partnerships.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-14">
      <h1 className="rule-gold font-display text-3xl font-bold">Contact us</h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_260px] md:items-start">
        <form
          className="space-y-5 rounded-lg border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Message sent", {
              description: "Our team replies within one working day.",
            });
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required maxLength={100} placeholder="Selam Bekele" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={255}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" required maxLength={150} placeholder="Employer verification" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required maxLength={1000} rows={6} placeholder="How can we help?" />
          </div>
          <Button type="submit" size="lg">
            Send message
          </Button>
        </form>

        <aside className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 text-primary" />
            <p className="text-muted-foreground">
              Bole Medhanialem, Ivory Building 4th floor
              <br />
              Addis Ababa, Ethiopia
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 text-primary" />
            <p className="text-muted-foreground">support@ethiojobsconnect.et</p>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 text-primary" />
            <p className="text-muted-foreground">+251 11 555 0142</p>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            Office hours: Monday to Friday, 2:30 – 11:30 (local time).
          </p>
        </aside>
      </div>
    </div>
  );
}
