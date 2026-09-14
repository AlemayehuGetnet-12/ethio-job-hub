import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EthioJobs Connect — Our Mission" },
      {
        name: "description",
        content:
          "EthioJobs Connect is a marketplace built to make hiring in Ethiopia transparent, fast and fair for job seekers and employers alike.",
      },
      { property: "og:title", content: "About EthioJobs Connect — Our Mission" },
      {
        property: "og:description",
        content:
          "A marketplace built to make hiring in Ethiopia transparent, fast and fair for everyone.",
      },
    ],
  }),
  component: AboutPage,
});

const stats = [
  { value: "1,240", label: "Live job listings" },
  { value: "480", label: "Verified employers" },
  { value: "6,800", label: "Successful hires" },
  { value: "11", label: "Regions covered" },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-14">
      <h1 className="rule-gold font-display text-3xl font-bold">About EthioJobs Connect</h1>

      <p className="mt-6 text-base/relaxed text-muted-foreground">
        Finding work in Ethiopia still relies too heavily on notice boards, printed vacancy
        announcements and word of mouth. EthioJobs Connect brings that process online: a single
        place where employers publish real openings with real salary ranges, and where candidates
        keep one professional profile instead of retyping it for every application.
      </p>

      <p className="mt-4 text-base/relaxed text-muted-foreground">
        We review every employer before their first listing goes live, and we ask for salary
        transparency on all roles. Job seekers can search by city, category, experience level and
        remote availability, then track each application from submitted through to hiring decision.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border/70 bg-card p-4">
            <p className="font-display text-2xl font-bold text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold">What we are building next</h2>
      <ul className="mt-4 space-y-2">
        {[
          "Job seeker profiles with CV upload and application tracking",
          "Employer dashboards for posting roles and shortlisting applicants",
          "Direct messaging between employers and candidates",
          "Amharic and Afaan Oromo interface options",
          "A Telegram companion for instant job alerts",
        ].map((item) => (
          <li key={item} className="flex gap-3 text-sm/relaxed text-muted-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
