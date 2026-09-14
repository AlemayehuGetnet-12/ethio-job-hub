"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";

export default function SavedJobsPage() {
  const { user, authHeaders } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    if (!user) return;
    axios.get(getApiUrl("/api/savedjobs"), { headers: authHeaders() })
      .then(res => { setSavedJobs(res.data.savedJobs || []); setLoading(false); })
      .catch(() => { setError("Unable to load saved jobs."); setLoading(false); });
  }, [user, authHeaders]);

  const unsave = async (jobId) => {
    setRemoving(jobId);
    try {
      await axios.delete(getApiUrl(`/api/savedjobs/${jobId}`), { headers: authHeaders() });
      setSavedJobs(prev => prev.filter(s => (s.job?._id || s.job) !== jobId));
    } catch { /* ignore */ }
    setRemoving(null);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
        <p className="text-slate-400">Sign in to view saved jobs.</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Saved Jobs</h1>
            <p className="mt-1 text-slate-400">{savedJobs.length} saved position{savedJobs.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/jobs" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500">Browse Jobs</Link>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-900" />)}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
            <p className="text-2xl">🔖</p>
            <p className="mt-3 text-slate-400">No saved jobs yet.</p>
            <Link href="/jobs" className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500">Explore Jobs</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {savedJobs.map(saved => {
              const job = saved.job;
              const jobId = job?._id || saved.job;
              return (
                <article key={saved._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2 text-xs mb-2">
                      {job?.type && <span className="rounded-full bg-slate-800 px-2 py-0.5 capitalize">{job.type}</span>}
                      {job?.isRemote && <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5">Remote</span>}
                    </div>
                    <h2 className="text-lg font-semibold">{job?.title || "Job"}</h2>
                    <p className="mt-1 text-sm text-slate-400">{job?.location || ""}</p>
                    {job?.salary && <p className="mt-1 text-sm text-emerald-400 font-medium">{job.salary.toLocaleString()} {job.salaryCurrency || "ETB"}</p>}
                    <p className="mt-2 text-xs text-slate-500">Saved {dualDate(saved.createdAt)}</p>
                  </div>
                  <div className="flex gap-3 mt-auto">
                    <Link href={`/jobs/${jobId}`} className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500">
                      View Job
                    </Link>
                    <button onClick={() => unsave(jobId)} disabled={removing === jobId}
                      className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50">
                      {removing === jobId ? "…" : "Unsave"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
