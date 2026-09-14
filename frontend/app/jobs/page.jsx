"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "../api-config";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch(getApiUrl("/api/jobs"));
        const data = await response.json();
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load jobs");
      }
    };

    loadJobs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">EthioJobs jobs</h1>
        <p className="mt-2 text-slate-300">Shared data view for the web app and Telegram bot.</p>

        {error ? (
          <div className="mt-6 rounded border border-red-500/40 bg-red-500/10 p-4 text-red-200">{error}</div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {jobs.length === 0 ? (
            <div className="rounded border border-slate-800 bg-slate-900 p-6 text-slate-400">No jobs available yet.</div>
          ) : (
            jobs.map((job, index) => (
              <article key={job._id || index} className="rounded border border-slate-800 bg-slate-900 p-6">
                <h2 className="text-xl font-semibold">{job.title || "Untitled role"}</h2>
                <p className="mt-2 text-slate-400">{job.company || "Company pending"}</p>
                <p className="mt-2 text-sm text-slate-500">{job.location || "Location pending"}</p>
                <p className="mt-4 text-sm text-emerald-400">{job.salary ? `${job.salary} ${job.salaryCurrency || "ETB"}` : "Salary pending"}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
