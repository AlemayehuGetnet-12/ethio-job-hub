"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { getApiUrl } from "../../api-config";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params?.id;
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const load = async () => {
      try {
        const [jobResponse, applicationsResponse] = await Promise.all([
          axios.get(getApiUrl(`/api/jobs/${jobId}`)),
          axios.get(getApiUrl("/api/applications"), { withCredentials: true }),
        ]);

        setJob(jobResponse.data.job);
        const existing = Array.isArray(applicationsResponse.data.applications)
          ? applicationsResponse.data.applications.find((app) => {
              return app.job?._id === jobId || app.job === jobId;
            })
          : null;
        setApplication(existing || null);
      } catch (err) {
        setError(err?.response?.data?.message || "Unable to load job details.");
      }
    };

    load();
  }, [jobId]);

  const handleApply = async (event) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await axios.post(
        getApiUrl("/api/applications"),
        { job: jobId, coverLetter, resumeUrl },
        { withCredentials: true }
      );
      setApplication(response.data.application);
      setMessage("Application submitted successfully.");
      setCoverLetter("");
      setResumeUrl("");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!application) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await axios.delete(getApiUrl(`/api/applications/${application._id}`), { withCredentials: true });
      setApplication({ ...application, status: "withdrawn" });
      setMessage("Your application has been withdrawn.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to withdraw the application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Job details</h1>
            <p className="mt-2 text-slate-400">Review the role and apply with your profile.</p>
          </div>
          <Link href="/jobs" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-primary">
            Back to jobs
          </Link>
        </div>

        {error && <div className="mb-4 rounded border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}
        {message && <div className="mb-4 rounded border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</div>}

        {!job ? (
          <div className="rounded border border-slate-800 bg-slate-900 p-8 text-slate-400">Loading job details...</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="rounded-full bg-slate-800 px-3 py-1">{job.type || 'Full-time'}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1">{job.location || 'Remote'}</span>
                {job.salary ? <span className="rounded-full bg-slate-800 px-3 py-1">{job.salary} {job.salaryCurrency || 'ETB'}</span> : null}
              </div>
              <h2 className="text-2xl font-semibold text-white">{job.title}</h2>
              <p className="mt-2 text-slate-300">{job.company || 'Company pending'}</p>
              <div className="mt-6 space-y-4 text-slate-300">
                <p>{job.description || 'No job description provided.'}</p>
                {job.skills?.length ? (
                  <div>
                    <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500">Skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Application status</h3>
                {application ? (
                  <div className="space-y-2">
                    <p className="text-slate-300">You have already applied for this role.</p>
                    <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
                      <p><span className="font-semibold">Status:</span> {application.status}</p>
                      {application.coverLetter ? <p>Cover letter submitted.</p> : <p>No cover letter.</p>}
                      {application.resumeUrl ? <p>Resume URL: <a className="text-primary underline" href={application.resumeUrl} target="_blank" rel="noreferrer">View</a></p> : null}
                    </div>
                    {application.status !== 'withdrawn' ? (
                      <button onClick={handleWithdraw} disabled={loading} className="w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60">
                        {loading ? 'Withdrawing...' : 'Withdraw application'}
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">This application was withdrawn.</div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <label className="block">
                      <span className="text-sm text-slate-400">Cover letter</span>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={6}
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm text-slate-400">Resume URL</span>
                      <input
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        type="url"
                        placeholder="https://example.com/resume"
                        className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
                      />
                    </label>
                    <button type="submit" disabled={loading} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
                      {loading ? 'Applying...' : 'Apply for this job'}
                    </button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}