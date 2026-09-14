"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Get in touch</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Contact</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Questions about hiring, applications, or partnership? Send us a message and we will get back
          to you.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-800 bg-slate-900 p-8">
            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
                Thanks for reaching out. We will respond soon.
              </div>
            ) : null}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-slate-300">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm text-slate-300">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary"
                placeholder="How can we help?"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Send message
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Email</h2>
              <p className="mt-2 text-slate-400">support@ethiojobs.connect</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Office</h2>
              <p className="mt-2 text-slate-400">Bole, Addis Ababa, Ethiopia</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Hours</h2>
              <p className="mt-2 text-slate-400">Mon – Fri, 9:00 AM – 6:00 PM EAT</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
