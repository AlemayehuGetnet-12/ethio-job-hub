"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { getApiUrl } from "../../api-config";
import { dualDate } from "../../utils/ethiopianCalendar";

const STATUS_COLORS = {
  submitted: "bg-slate-700 text-slate-200",
  reviewing: "bg-amber-500/20 text-amber-300",
  shortlisted: "bg-blue-500/20 text-blue-300",
  interview: "bg-purple-500/20 text-purple-300",
  hired: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-rose-500/20 text-rose-300",
  withdrawn: "bg-slate-600/40 text-slate-400",
};

const NEXT_STATUSES = {
  submitted: ["reviewing", "shortlisted", "rejected"],
  reviewing: ["shortlisted", "interview", "rejected"],
  shortlisted: ["interview", "hired", "rejected"],
  interview: ["hired", "rejected"],
};

export default function EmployerDashboardPage() {
  const { user, loading: authLoading, authHeaders } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role !== "employer" && user.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }
    const h = authHeaders();
    Promise.allSettled([
      axios.get(getApiUrl("/api/jobs?limit=50"), { headers: h }),
      axios.get(getApiUrl("/api/applications/employer"), { headers: h }),
      axios.get(getApiUrl("/api/analytics/employer"), { headers: h }),
    ]).then(([jobsRes, appsRes, analyticsRes]) => {
      if (jobsRes.status === "fulfilled") {
        const all = jobsRes.value.data.jobs || [];
        setJobs(all.filter(j => j.employer === user.id || j.employer?._id === user.id || String(j.employer) === String(user.id)));
      }
      if (appsRes.status === "fulfilled") setApplications(appsRes.value.data.applications || []);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
      setLoading(false);
    });
  }, [user, authLoading, authHeaders]);

  const updateStatus = async (appId, status) => {
    setStatusUpdating(appId);
    try {
      const res = await axios.put(getApiUrl(`/api/applications/${appId}`), { status }, { headers: authHeaders() });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (e) { /* ignore */ }
    setStatusUpdating(null);
  };

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }
  if (!user) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100"><Link href="/login" className="text-primary underline">Sign in</Link></div>;

  const stats = {
    jobs: jobs.length,
    total: applications.length,
    pending: applications.filter(a => ["submitted","reviewing"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "interview").length,
    hired: applications.filter(a => a.status === "hired").length,
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Employer Dashboard</p>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs/new" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500">Post Job</Link>
            <Link href="/employer/company" className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">Company Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Jobs Posted", value: stats.jobs },
            { label: "Total Applicants", value: stats.total, color: "text-blue-300" },
            { label: "Pending Review", value: stats.pending, color: "text-amber-300" },
            { label: "Interviews", value: stats.interviews, color: "text-purple-300" },
            { label: "Hired", value: stats.hired, color: "text-emerald-300" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className={`mt-1 text-3xl font-semibold ${s.color || "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1 w-fit">
          {["overview", "jobs", "applicants", "interviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? "bg-primary text-white" : "text-slate-400 hover:text-slate-100"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold">Recent Applications</h2>
              {applications.length === 0 ? <p className="mt-3 text-sm text-slate-400">No applications yet.</p> : (
                <ul className="mt-4 space-y-3">
                  {applications.slice(0, 5).map(app => (
                    <li key={app._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{app.applicant?.name || "Candidate"}</p>
                        <p className="text-xs text-slate-400">{app.job?.title || "Job"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[app.status] || ""}`}>{app.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold">Your Jobs</h2>
              {jobs.length === 0 ? (
                <div className="mt-3 text-sm text-slate-400">No jobs posted yet. <Link href="/jobs/new" className="text-primary underline">Post one now</Link></div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <li key={job._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.location}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${job.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                        {job.isActive ? "Active" : "Closed"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {/* Jobs tab */}
        {activeTab === "jobs" && (
          <div className="mt-6 space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                No jobs posted yet. <Link href="/jobs/new" className="text-primary underline">Post your first job</Link>
              </div>
            ) : jobs.map(job => (
              <div key={job._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-slate-400">{job.location} · <span className="capitalize">{job.type}</span></p>
                  <p className="text-xs text-slate-500 mt-1">{dualDate(job.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`rounded-full px-3 py-1 text-xs ${job.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                    {job.isActive ? "Active" : "Closed"}
                  </span>
                  <Link href={`/jobs/${job._id}`} className="rounded-full border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Applicants tab */}
        {activeTab === "applicants" && (
          <div className="mt-6 space-y-4">
            {applications.length === 0 ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">No applications received yet.</div>
            ) : applications.map(app => (
              <div key={app._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{app.applicant?.name || "Candidate"}</p>
                    <p className="text-sm text-slate-400">{app.job?.title || "Job"} · Applied {dualDate(app.createdAt)}</p>
                    {app.resumeUrl && <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="mt-1 text-xs text-primary underline">View CV</a>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_COLORS[app.status] || ""}`}>{app.status}</span>
                    {NEXT_STATUSES[app.status] && (
                      <select disabled={statusUpdating === app._id}
                        onChange={e => e.target.value && updateStatus(app._id, e.target.value)}
                        defaultValue=""
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none">
                        <option value="" disabled>Move to…</option>
                        {NEXT_STATUSES[app.status].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                {app.coverLetter && <p className="mt-3 rounded-xl bg-slate-950 p-3 text-sm text-slate-300">{app.coverLetter.slice(0, 200)}{app.coverLetter.length > 200 ? "…" : ""}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Interviews tab */}
        {activeTab === "interviews" && (
          <div className="mt-6">
            <Link href="/dashboard/interviews" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500">
              Manage Interviews →
            </Link>
            <div className="mt-4 space-y-3">
              {applications.filter(a => a.status === "interview" && a.interview?.date).map(app => (
                <div key={app._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                  <p className="font-semibold">{app.applicant?.name}</p>
                  <p className="text-sm text-slate-400">{app.job?.title}</p>
                  <p className="mt-1 text-sm text-purple-300">{dualDate(app.interview.date)} · {app.interview.mode || "online"}</p>
                  {app.interview.location && <p className="text-xs text-slate-500">{app.interview.location}</p>}
                </div>
              ))}
              {applications.filter(a => a.status === "interview").length === 0 && (
                <p className="text-slate-400">No interviews scheduled. Move applicants to "interview" status first.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
