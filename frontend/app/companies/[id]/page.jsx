import Link from "next/link";
import { getApiUrl } from "../../api-config";

export async function generateMetadata({ params }) {
  try {
    const res = await fetch(getApiUrl(`/api/companies/${params.id}`), { cache: "no-store" });
    if (!res.ok) return { title: "Company | EthioJobs Connect" };
    const data = await res.json();
    const company = data.company || data;
    return {
      title: `${company.name} Jobs | EthioJobs Connect`,
      description: company.description || `View open jobs at ${company.name} on EthioJobs Connect.`,
      openGraph: {
        title: `${company.name} | EthioJobs Connect`,
        description: company.description || "",
        type: "website",
      },
    };
  } catch {
    return { title: "Company | EthioJobs Connect" };
  }
}

async function getCompany(id) {
  try {
    const res = await fetch(getApiUrl(`/api/companies/${id}`), { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.company || data;
  } catch { return null; }
}

async function getCompanyJobs(id) {
  try {
    const res = await fetch(getApiUrl(`/api/jobs?company=${id}&limit=20`), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs || [];
  } catch { return []; }
}

export default async function CompanyDetailPage({ params }) {
  const [company, jobs] = await Promise.all([getCompany(params.id), getCompanyJobs(params.id)]);

  if (!company) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Company not found</h1>
          <Link href="/companies" className="mt-4 inline-block text-primary underline">Back to companies</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        {/* Hero */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-3xl font-bold text-white">
              {company.logo
                ? <img src={company.logo} alt={company.name} className="h-full w-full rounded-2xl object-cover" />
                : (company.name || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{company.name}</h1>
              <p className="mt-1 text-slate-400">{company.industry || company.sector || ""}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-400">
                {company.location && <span>📍 {company.location}</span>}
                {company.size && <span>👥 {company.size}</span>}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noreferrer" className="text-primary underline">🌐 Website</a>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <p className="mt-6 text-slate-300 leading-relaxed">{company.description}</p>
          )}
        </div>

        {/* Open Jobs */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Open Positions ({jobs.length})</h2>
          {jobs.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-400">
              No open positions right now.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {jobs.map(job => (
                <Link key={job._id} href={`/jobs/${job._id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-primary">
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{job.location} · <span className="capitalize">{job.type}</span></p>
                  {job.salary && <p className="mt-1 text-sm text-emerald-400">{job.salary.toLocaleString()} {job.salaryCurrency || "ETB"}</p>}
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8">
          <Link href="/companies" className="text-sm text-slate-400 underline hover:text-slate-100">← Back to all companies</Link>
        </div>
      </div>
    </main>
  );
}
