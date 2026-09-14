"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiUrl } from "../api-config";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadApplications = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await axios.get(getApiUrl("/api/applications"), { withCredentials: true });
      setApplications(response.data.applications || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const withdraw = async (applicationId) => {
    setError(null);
    setMessage(null);
    try {
      await axios.delete(getApiUrl(`/api/applications/${applicationId}`), { withCredentials: true });
      setApplications((prev) => prev.map((app) => (app._id === applicationId ? { ...app, status: "withdrawn" } : app)));
      setMessage("Application withdrawn successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to withdraw the application.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">My applications</h1>
            <p className="mt-2 text-slate-400">Track applications, view status, and withdraw any current submission.</p>
          </div>
          <Link href="/jobs" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-primary">
            Browse jobs
          </Link>
        </div>

        {error && <div className="mb-4 rounded border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}
        {message && <div className="mb-4 rounded border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</div>}

        {loading ? (
          <div className="rounded border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="rounded border border-slate-800 bg-slate-900 p-8 text-slate-400">You have not applied to any jobs yet.</div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{application.job?.title || 'Job title unavailable'}</h2>
                    <p className="text-sm text-slate-400">{application.job?.company || 'Company unavailable'}</p>
                    <p className="mt-2 text-sm text-slate-400">Status: <span className="text-slate-100">{application.status}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={application.job?._id ? `/jobs/${application.job._id}` : "/jobs"} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-primary">
                      View job
                    </Link>
                    {application.status !== "withdrawn" && (
                      <button onClick={() => withdraw(application._id)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
                {application.coverLetter && <p className="mt-4 text-sm text-slate-300">Cover letter submitted.</p>}
                {application.resumeUrl && (
                  <p className="mt-2 text-sm text-slate-300">
                    Resume: <a href={application.resumeUrl} target="_blank" rel="noreferrer" className="text-primary underline">View</a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
