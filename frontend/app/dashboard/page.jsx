"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";

const STATUS_COLORS = {
  submitted: "bg-slate-700 text-slate-200",
  reviewing: "bg-amber-500/20 text-amber-300",
  shortlisted: "bg-blue-500/20 text-blue-300",
  interview: "bg-purple-500/20 text-purple-300",
  hired: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-rose-500/20 text-rose-300",
  withdrawn: "bg-slate-600/40 text-slate-400",
};

function StatCard({ label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, authHeaders } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role === "employer") { window.location.href = "/employer/dashboard"; return; }
    if (user.role === "admin") { window.location.href = "/admin"; return; }

    const headers = authHeaders();
    Promise.allSettled([
      axios.get(getApiUrl("/api/applications"), { headers }),
      axios.get(getApiUrl("/api/savedjobs"), { headers }),
      axios.get(getApiUrl("/api/jobs/recommendations"), { headers }),
      axios.get(getApiUrl("/api/notifications"), { headers }),
    ]).then(([apps, saved, recs, notifs]) => {
      if (apps.status === "fulfilled") setApplications(apps.value.data.applications || []);
      if (saved.status === "fulfilled") setSavedJobs(saved.value.data.savedJobs || []);
      if (recs.status === "fulfilled") setRecommendations(recs.value.data.jobs || []);
      if (notifs.status === "fulfilled") setNotifications(notifs.value.data.notifications || []);
      setLoading(false);
    });
  }, [user, authLoading, authHeaders]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
        <p className="text-slate-400">Please sign in to view your dashboard.</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500">Sign in</Link>
      </div>
    );
  }

  const stats = {
    total: applications.length,
    active: applications.filter(a => !["hired","rejected","withdrawn"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "interview").length,
    hired: applications.filter(a => a.status === "hired").length,
  };

  const unread = notifications.filter(n => !n.readAt).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold">{user.name}</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/jobs" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500">Browse Jobs</Link>
            <Link href="/profile" className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">Edit Profile</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Applied" value={stats.total} />
          <StatCard label="Active" value={stats.active} color="text-blue-300" />
          <StatCard label="Interviews" value={stats.interviews} color="text-purple-300" />
          <StatCard label="Hired" value={stats.hired} color="text-emerald-300" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Recent Applications */}
          <section className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Applications</h2>
              <Link href="/applications" className="text-sm text-primary hover:underline">View all</Link>
            </div>
            {applications.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-400">
                No applications yet. <Link href="/jobs" className="text-primary underline">Browse jobs</Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {applications.slice(0, 5).map(app => (
                  <li key={app._id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{app.job?.title || "Job"}</p>
                      <p className="text-xs text-slate-500">{dualDate(app.createdAt)}</p>
                    </div>
                    <span className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_COLORS[app.status] || "bg-slate-700 text-slate-200"}`}>
                      {app.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Right column */}
          <div className="space-y-6">

            {/* Notifications */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notifications</h2>
                {unread > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>
                )}
              </div>
              <Link href="/notifications" className="mt-1 block text-sm text-primary hover:underline">View all</Link>
              {notifications.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No notifications.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {notifications.slice(0, 4).map(n => (
                    <li key={n._id} className={`rounded-xl p-3 text-sm ${n.readAt ? "text-slate-400" : "bg-slate-800 text-slate-100"}`}>
                      <p className="font-medium">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Saved Jobs */}
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Saved Jobs</h2>
                <Link href="/saved-jobs" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              {savedJobs.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No saved jobs yet.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {savedJobs.slice(0, 3).map(s => (
                    <li key={s._id}>
                      <Link href={`/jobs/${s.job?._id || s.job}`} className="block rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm hover:border-primary">
                        <p className="font-medium">{s.job?.title || "Job"}</p>
                        <p className="text-xs text-slate-500">{s.job?.location || ""}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* Job Recommendations */}
        {recommendations.length > 0 && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Recommended for You</h2>
            <p className="mt-1 text-sm text-slate-400">Based on your skills and location.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.slice(0, 6).map(job => (
                <Link key={job._id} href={`/jobs/${job._id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 transition hover:border-primary">
                  <p className="font-medium">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{job.location}</p>
                  {job.salary && <p className="mt-1 text-sm text-emerald-400">{job.salary.toLocaleString()} {job.salaryCurrency || "ETB"}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Telegram Alerts */}
        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Job Alerts & Integrations</h2>
          <p className="mt-1 text-sm text-slate-400">Manage Telegram job alerts and notification preferences.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/dashboard/alerts" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500">Manage Telegram Alerts</Link>
            <Link href="/messages" className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">Messages</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
