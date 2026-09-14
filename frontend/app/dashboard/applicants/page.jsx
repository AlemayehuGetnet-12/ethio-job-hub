"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { getApiUrl } from "../../api-config";

export default function ApplicantDashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplications = async () => {
      setError(null);
      setLoading(true);
      try {
        const response = await axios.get(getApiUrl("/api/applications/employer"), { withCredentials: true });
        setApplications(response.data.applications || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load applications for your jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Applicant tracking</h1>
          <p className="mt-2 text-slate-400">View applications submitted for your jobs and manage candidates.</p>
        </div>

        {error && <div className="mb-4 rounded border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {loading ? (
          <div className="rounded border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="rounded border border-slate-800 bg-slate-900 p-8 text-slate-400">No applications found for your posted jobs.</div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{application.job?.title || 'Untitled job'}</h2>
                    <p className="text-sm text-slate-400">Applicant: {application.applicant?.name || 'Unknown'}</p>
                    <p className="text-sm text-slate-400">Status: {application.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/jobs/${application.job?._id || ''}`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-primary">
                      View job
                    </Link>
                    <Link href={`/applications`} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-primary">
                      View applicant
                    </Link>
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
