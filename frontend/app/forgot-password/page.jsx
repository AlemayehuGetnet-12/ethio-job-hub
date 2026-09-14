"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import Link from "next/link";
import { getApiUrl } from "../api-config";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await axios.post(getApiUrl("/api/auth/forgot-password"), data);
      setStatus("If an account exists for that email, a password reset link has been sent.");
    } catch (err) {
      setError("Unable to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          <p className="mt-3 text-slate-400">Enter your email and we will send you a link to reset your password.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm text-slate-400">Email</span>
              <input
                type="email"
                {...register("email")}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary"
              />
              {errors.email && <span className="text-sm text-rose-400">{errors.email.message}</span>}
            </label>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {status && <p className="text-sm text-emerald-400">{status}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <p className="mt-6 text-sm text-slate-400">
            Remembered your password? <Link href="/login" className="text-white underline">Sign in</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
