import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">About us</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Connecting Ethiopian talent with trusted employers.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-slate-300">
          EthioJobs Connect is a job marketplace built for Ethiopia. We help job seekers find local
          opportunities and help employers hire verified candidates across Addis Ababa, Oromia,
          Amhara, and beyond.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">For job seekers</h2>
            <p className="mt-3 text-slate-400">
              Browse openings, build your profile, and apply to roles that match your skills and city.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">For employers</h2>
            <p className="mt-3 text-slate-400">
              Post jobs, review applicants, and schedule interviews from one simple dashboard.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Local first</h2>
            <p className="mt-3 text-slate-400">
              Designed around Ethiopian cities, languages, and the way local hiring actually works.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/jobs"
            className="rounded-full bg-primary px-8 py-3 text-center text-white transition hover:bg-blue-500"
          >
            Browse jobs
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-slate-700 px-8 py-3 text-center text-slate-100 transition hover:bg-slate-800"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
