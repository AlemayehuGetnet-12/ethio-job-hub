"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";

export default function AdminPage() {
  const { user, loading: authLoading, authHeaders } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    if (user.role !== "admin") { window.location.href = "/dashboard"; return; }

    const h = authHeaders();
    Promise.allSettled([
      axios.get(getApiUrl("/api/admin/stats"), { headers: h }),
      axios.get(getApiUrl("/api/admin/users?limit=50"), { headers: h }),
      axios.get(getApiUrl("/api/jobs?limit=50"), { headers: h }),
    ]).then(([statsRes, usersRes, jobsRes]) => {
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data.users || []);
      if (jobsRes.status === "fulfilled") setJobs(jobsRes.value.data.jobs || []);
      setLoading(false);
    });
  }, [user, authLoading, authHeaders]);

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await axios.put(getApiUrl(`/api/admin/users/${userId}`), { isActive: !isActive }, { headers: authHeaders() });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      setActionMsg(isActive ? "User deactivated." : "User activated.");
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e) { setActionMsg("Action failed."); }
  };

  const toggleJobStatus = async (jobId, isActive) => {
    try {
      await axios.put(getApiUrl(`/api/jobs/${jobId}`), { isActive: !isActive }, { headers: authHeaders() });
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, isActive: !isActive } : j));
      setActionMsg(isActive ? "Job deactivated." : "Job activated.");
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e) { setActionMsg("Action failed."); }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Delete this job permanently?")) return;
    try {
      await axios.delete(getApiUrl(`/api/jobs/${jobId}`), { headers: authHeaders() });
      setJobs(prev => prev.filter(j => j._id !== jobId));
      setActionMsg("Job deleted.");
      setTimeout(() => setActionMsg(null), 3000);
    } catch (e) { setActionMsg("Delete failed."); }
  };

  if (authLoading || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }
  if (!user || user.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Access denied.</div>;
  }

  const ROLE_BADGE = { admin: "bg-rose-500/20 text-rose-300", employer: "bg-blue-500/20 text-blue-300", jobseeker: "bg-slate-700 text-slate-300" };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

        <div className="mb-8">
          <p className="text-sm text-slate-400">Admin</p>
          <h1 className="text-3xl font-semibold">Platform Dashboard</h1>
        </div>

        {actionMsg && <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{actionMsg}</div>}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
            {[
              { label: "Total Users", value: stats.totalUsers, color: "text-white" },
              { label: "Employers", value: stats.totalEmployers, color: "text-blue-300" },
              { label: "Job Seekers", value: stats.totalJobSeekers, color: "text-slate-200" },
              { label: "Total Jobs", value: stats.totalJobs, color: "text-emerald-300" },
              { label: "Active Jobs", value: stats.activeJobs, color: "text-emerald-300" },
              { label: "Total Applications", value: stats.totalApplications, color: "text-purple-300" },
              { label: "Companies", value: stats.totalCompanies, color: "text-amber-300" },
              { label: "Hired", value: stats.hiredApplications, color: "text-emerald-400" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${s.color}`}>{s.value ?? "—"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-slate-800 bg-slate-900 p-1 w-fit mb-6">
          {["overview", "users", "jobs"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-5 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? "bg-primary text-white" : "text-slate-400 hover:text-slate-100"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold mb-4">Recent Users</h2>
              <ul className="space-y-2">
                {users.slice(0, 6).map(u => (
                  <li key={u._id} className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-medium">{u.name}</span>
                      <span className="ml-2 text-xs text-slate-500">{u.email}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${ROLE_BADGE[u.role] || ""}`}>{u.role}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="font-semibold mb-4">Recent Jobs</h2>
              <ul className="space-y-2">
                {jobs.slice(0, 6).map(job => (
                  <li key={job._id} className="flex items-center justify-between rounded-xl bg-slate-950 px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-medium">{job.title}</span>
                      <span className="ml-2 text-xs text-slate-500">{job.location}</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${job.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                      {job.isActive ? "Active" : "Closed"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Users tab */}
        {activeTab === "users" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  {["Name", "Email", "Role", "Joined", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs capitalize ${ROLE_BADGE[u.role] || ""}`}>{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-500">{dualDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${u.isActive !== false ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleUserStatus(u._id, u.isActive !== false)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-700">
                        {u.isActive !== false ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Jobs tab */}
        {activeTab === "jobs" && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 bg-slate-950">
                <tr>
                  {["Title", "Location", "Type", "Posted", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3 text-slate-400">{job.location}</td>
                    <td className="px-4 py-3 capitalize text-slate-400">{job.type}</td>
                    <td className="px-4 py-3 text-slate-500">{dualDate(job.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${job.isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"}`}>
                        {job.isActive ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleJobStatus(job._id, job.isActive)}
                          className="rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-700">
                          {job.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => deleteJob(job._id)}
                          className="rounded-full border border-rose-500/40 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
