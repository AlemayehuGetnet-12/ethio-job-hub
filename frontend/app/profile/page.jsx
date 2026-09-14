"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { ETHIOPIAN_CITIES } from "../utils/ethiopiaCities";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
  cvUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export default function ProfilePage() {
  const { user, authHeaders, refetch } = useAuth();
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cvUrl, setCvUrl] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        location: user.location || "",
        skills: (user.skills || []).join(", "),
        cvUrl: user.cvUrl || "",
      });
      setCvUrl(user.cvUrl || "");
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name: data.name,
        phone: data.phone || "",
        location: data.location || "",
        skills: data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
        cvUrl: cvUrl || data.cvUrl || "",
      };
      await axios.put(getApiUrl("/api/users/profile"), payload, { headers: authHeaders() });
      await refetch();
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(getApiUrl("/api/upload"), formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url || res.data.fileUrl || "";
      setCvUrl(url);
      setSuccess("CV uploaded. Click Save to apply.");
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed. Try a URL instead.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
        <p className="text-slate-400">Please sign in to view your profile.</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold">My Profile</h1>
          <p className="mt-2 text-slate-400">Keep your information up to date so employers can find you.</p>
        </div>

        {error && <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}
        {success && <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">{success}</div>}

        {/* Avatar / initials */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-slate-400 capitalize">{user.role} · {user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-5">
            <h2 className="font-semibold text-slate-200">Personal Information</h2>

            <label className="block">
              <span className="text-sm text-slate-400">Full Name</span>
              <input {...register("name")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-primary" />
              {errors.name && <span className="text-sm text-rose-400">{errors.name.message}</span>}
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Phone</span>
              <input {...register("phone")} placeholder="+251 9XX XXX XXX" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-primary" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400">Location</span>
              <select {...register("location")} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-primary">
                <option value="">Select city</option>
                {ETHIOPIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {/* Skills */}
          {user.role === "jobseeker" && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="font-semibold text-slate-200">Skills</h2>
              <label className="block">
                <span className="text-sm text-slate-400">Skills (comma-separated)</span>
                <input {...register("skills")} placeholder="React, Node.js, Python, Excel…" className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-primary" />
              </label>
            </div>
          )}

          {/* CV / Resume */}
          {user.role === "jobseeker" && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="font-semibold text-slate-200">CV / Resume</h2>

              {/* Upload */}
              <div>
                <span className="text-sm text-slate-400">Upload CV (PDF/DOC)</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} disabled={uploading}
                  className="mt-2 block w-full text-sm text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500" />
                {uploading && <p className="mt-2 text-sm text-slate-400">Uploading…</p>}
              </div>

              {/* Or URL */}
              <label className="block">
                <span className="text-sm text-slate-400">Or enter CV URL</span>
                <input value={cvUrl} onChange={e => setCvUrl(e.target.value)} type="url" placeholder="https://drive.google.com/your-cv"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-primary" />
              </label>

              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary underline">
                  View current CV →
                </a>
              )}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
