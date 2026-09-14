"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiUrl } from "../api-config";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch(getApiUrl("/api/companies"));
        if (!response.ok) throw new Error("Unable to load companies");
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.companies)
            ? data.companies
            : [];
        setCompanies(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load companies");
        // Fallback sample data so the page is still useful without the API
        setCompanies([
          { name: "Ethio Telecom", industry: "Telecommunications", location: "Addis Ababa" },
          { name: "Commercial Bank of Ethiopia", industry: "Finance", location: "Addis Ababa" },
          { name: "Ethiopian Airlines", industry: "Aviation", location: "Addis Ababa" },
          { name: "Safaricom Ethiopia", industry: "Telecommunications", location: "Addis Ababa" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Employers</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Companies</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Discover verified Ethiopian employers hiring across software, finance, healthcare, and more.
        </p>

        {loading ? (
          <p className="mt-10 text-slate-400">Loading companies…</p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            Could not reach the companies API. Showing sample employers instead.
          </div>
        ) : null}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.length === 0 && !loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400 sm:col-span-2 lg:col-span-3">
              No companies listed yet.
            </div>
          ) : (
            companies.map((company, index) => (
              <article
                key={company._id || company.id || company.name || index}
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-primary"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-lg font-semibold text-white">
                  {(company.name || "C").charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-4 text-xl font-semibold">{company.name || "Unnamed company"}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {company.industry || company.sector || "Industry pending"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {company.location || company.city || "Location pending"}
                </p>
              </article>
            ))
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/jobs"
            className="rounded-full bg-primary px-8 py-3 text-white transition hover:bg-blue-500"
          >
            View open jobs
          </Link>
        </div>
      </div>
    </main>
  );
}
