"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { getApiUrl } from "../api-config";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["jobseeker", "employer"]),
});

export default function RegisterPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      // use centralized helper for API URL
      await axios.post(getApiUrl('/api/auth/register'), data, { withCredentials: true });
      setLoading(false);
    } catch (err) {
      setError("Unable to create account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="mt-3 text-slate-400">Join EthioJobs Connect as a job seeker or employer today.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm text-slate-400">Full name</span>
              <input
                type="text"
                {...register("name")}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
              {errors.name && <span className="text-sm text-rose-400">{errors.name.message}</span>}
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Email</span>
              <input
                type="email"
                {...register("email")}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
              {errors.email && <span className="text-sm text-rose-400">{errors.email.message}</span>}
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Password</span>
              <input
                type="password"
                {...register("password")}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
              {errors.password && <span className="text-sm text-rose-400">{errors.password.message}</span>}
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Account type</span>
              <select
                {...register("role")}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
              {errors.role && <span className="text-sm text-rose-400">{errors.role.message}</span>}
            </label>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-white underline">Sign in</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
