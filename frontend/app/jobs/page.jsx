"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";
import { ETHIOPIAN_CITIES } from "../utils/ethiopiaCities";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship"];
const CATEGORIES = ["Software", "Finance", "Healthcare", "Logistics", "Education", "Hospitality", "Engineering", "Marketing", "HR", "Legal", "Other"];
const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "salary_desc", label: "Salary: high to low" },
  { value: "salary_asc", label: "Salary: low to high" },
];

const STATUS_BADGE = {
  submitted: "bg-slate-700 text-slate-200",
  reviewing: "bg-amber-500/20 text-amber-300",
  shortlisted: "bg-blue-500/20 text-blue-300",
  interview: "bg-purple-500/20 text-purple-300",
  hired: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-rose-500/20 text-rose-300",
  withdrawn: "bg-slate-600/40 text-slate-400",
};

export default function JobsPage() {
  const { user, authHeaders } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());

  // Filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (location) p.set("location", location);
    if (category) p.set("category", category);
    if (type) p.set("type", type);
    if (isRemote) p.set("isRemote", "true");
    if (salaryMin) p.set("salaryMin", salaryMin);
    if (salaryMax) p.set("salaryMax", salaryMax);
    p.set("sort", sort);
    p.set("page", page);
    p.set("limit", "12");
    return p.toString();
  }, [search, location, category, type, isRemote, salaryMin, salaryMax, sort, page]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/api/jobs?${buildQuery()}`));
      const data = await res.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setMeta(data.meta || { total: 0, pages: 1 });
    } catch (err) {
      setError("Unable to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Load user's saved/applied job IDs
  useEffect(() => {
    if (!user) return;
    const h = authHeaders();
    Promise.allSettled([
      fetch(getApiUrl("/api/savedjobs"), { headers: h }),
      fetch(getApiUrl("/api/applications"), { headers: h }),
    ]).then(async ([saved, apps]) => {
      if (saved.status === "fulfilled") {
        const d = await saved.value.json();
        setSavedIds(new Set((d.savedJobs || []).map(s => s.job?._id || s.job)));
      }
      if (apps.status === "fulfilled") {
        const d = await apps.value.json();
        setAppliedIds(new Set((d.applications || []).map(a => a.job?._id || a.job)));
      }
    });
  }, [user, authHeaders]);

  const toggleSave = async (jobId) => {
    if (!user) { window.location.href = "/login"; return; }
    const h = authHeaders();
    if (savedIds.has(jobId)) {
      await fetch(getApiUrl(`/api/savedjobs/${jobId}`), { method: "DELETE", headers: h });
      setSavedIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
    } else {
      await fetch(getApiUrl("/api/savedjobs"), { method: "POST", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ job: jobId }) });
      setSavedIds(prev => new Set([...prev, jobId]));
    }
  };

  const resetFilters = () => {
    setSearch(""); setLocation(""); setCategory(""); setType("");
    setIsRemote(false); setSalaryMin(""); setSalaryMax(""); setSort("date_desc"); setPage(1);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Job Listings</h1>
          <p className="mt-1 text-slate-400">{meta.total} jobs found across Ethiopia</p>
        </div>

        {/* Search + filter toggle */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search job title, company, or keyword…"
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-primary" />
          <button onClick={() => setShowFilters(v => !v)}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800">
            {showFilters ? "Hide filters" : "Filters"} {showFilters ? "▲" : "▼"}
          </button>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-xs text-slate-400">Location</span>
                <select value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none">
                  <option value="">All locations</option>
                  {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Category</span>
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none">
                  <option value="">All categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Job type</span>
                <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none">
                  <option value="">All types</option>
                  {JOB_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Min salary (ETB)</span>
                <input type="number" value={salaryMin} onChange={e => { setSalaryMin(e.target.value); setPage(1); }}
                  placeholder="e.g. 5000"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Max salary (ETB)</span>
                <input type="number" value={salaryMax} onChange={e => { setSalaryMax(e.target.value); setPage(1); }}
                  placeholder="e.g. 50000"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none" />
              </label>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={isRemote} onChange={e => { setIsRemote(e.target.checked); setPage(1); }}
                    className="h-4 w-4 rounded border-slate-700 accent-primary" />
                  <span className="text-sm text-slate-200">Remote only</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={resetFilters} className="text-sm text-slate-400 underline hover:text-slate-100">Reset filters</button>
            </div>
          </div>
        )}

        {error && <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {/* Job grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-5 h-44" />
            ))
          ) : jobs.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              No jobs match your filters. <button onClick={resetFilters} className="text-primary underline">Clear filters</button>
            </div>
          ) : (
            jobs.map(job => (
              <article key={job._id} className="group relative flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-5 transition hover:border-primary">
                {/* Save button */}
                <button onClick={() => toggleSave(job._id)}
                  title={savedIds.has(job._id) ? "Unsave" : "Save job"}
                  className="absolute right-4 top-4 text-xl leading-none">
                  {savedIds.has(job._id) ? "🔖" : "🤍"}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 capitalize">{job.type || "full-time"}</span>
                    {job.isRemote && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">Remote</span>}
                    {job.category && <span className="rounded-full bg-slate-800 px-2 py-0.5">{job.category}</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold leading-tight">{job.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{job.location || "Location TBD"}</p>
                  {job.salary && (
                    <p className="mt-1 text-sm text-emerald-400 font-medium">
                      {job.salary.toLocaleString()} {job.salaryCurrency || "ETB"}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">{dualDate(job.createdAt)}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link href={`/jobs/${job._id}`}
                    className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500">
                    View Job
                  </Link>
                  {appliedIds.has(job._id) && (
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE.submitted}`}>Applied</span>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm disabled:opacity-40 hover:bg-slate-800">
              ← Prev
            </button>
            <span className="text-sm text-slate-400">Page {page} of {meta.pages}</span>
            <button disabled={page === meta.pages} onClick={() => setPage(p => p + 1)}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm disabled:opacity-40 hover:bg-slate-800">
              Next →
            </button>
          </div>
        )}

        {user?.role === "employer" && (
          <div className="mt-8 text-center">
            <Link href="/jobs/new" className="rounded-full bg-primary px-8 py-3 text-white hover:bg-blue-500">Post a Job</Link>
          </div>
        )}
      </div>
    </main>
  );
}
