"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
});

export default function PostJobPage() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const payload = {
        title: data.title,
        company: data.company,
      };
      if (data.location) payload.location = data.location;
      if (data.salary) payload.salary = Number(data.salary);
      if (data.description) payload.description = data.description;

      await axios.post(`${apiBase}/api/jobs`, payload, { withCredentials: true });
      setSuccess("Job posted successfully.");
      reset();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Unable to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Post a new job</h1>
        <p className="mt-2 text-slate-400">Employers can post job openings here. You must be signed in as an employer.</p>

        {error && <div className="mt-4 rounded border border-rose-600/30 bg-rose-600/10 p-4 text-rose-200">{error}</div>}
        {success && <div className="mt-4 rounded border border-emerald-600/30 bg-emerald-600/10 p-4 text-emerald-200">{success}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-slate-400">Title</span>
            <input {...register("title")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none" />
            {errors.title && <span className="text-sm text-rose-400">{errors.title.message}</span>}
          </label>

          <label className="block">
            <span className="text-sm text-slate-400">Company</span>
            <input {...register("company")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none" />
            {errors.company && <span className="text-sm text-rose-400">{errors.company.message}</span>}
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-slate-400">Location</span>
              <input {...register("location")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Salary (numeric)</span>
              <input {...register("salary")} type="number" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-slate-400">Description</span>
            <textarea {...register("description")} rows={6} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none" />
          </label>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
              {loading ? "Posting..." : "Post Job"}
            </button>

            <Link href="/jobs" className="text-sm text-slate-400 underline">Back to jobs</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
