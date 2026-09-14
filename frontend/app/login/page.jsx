"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import TelegramLogin from "../components/TelegramLogin";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user?.role === "employer") router.push("/employer/dashboard");
      else if (user?.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-3xl font-semibold">Sign in</h1>
          <p className="mt-3 text-slate-400">Access your job seeker or employer dashboard.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm text-slate-400">Email</span>
              <input type="email" {...register("email")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary" />
              {errors.email && <span className="text-sm text-rose-400">{errors.email.message}</span>}
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Password</span>
              <input type="password" {...register("password")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-primary" />
              {errors.password && <span className="text-sm text-rose-400">{errors.password.message}</span>}
            </label>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <div className="mb-3 text-sm text-slate-400">Or sign in with Telegram</div>
            <TelegramLogin botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME} />
          </div>

          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            <Link href="/forgot-password" className="text-white underline">Forgot your password?</Link>
            <p>New to EthioJobs? <Link href="/register" className="text-white underline">Create an account</Link>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
