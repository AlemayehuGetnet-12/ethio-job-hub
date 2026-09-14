import Link from "next/link";

const cities = [
  { name: "Addis Ababa", icon: "🌆" },
  { name: "Bahir Dar", icon: "🌊" },
  { name: "Dire Dawa", icon: "🏙️" },
  { name: "Mekelle", icon: "⛰️" },
  { name: "Hawassa", icon: "🌅" },
];
const categories = [
  { name: "Software", icon: "💻" },
  { name: "Finance", icon: "💰" },
  { name: "Healthcare", icon: "🩺" },
  { name: "Logistics", icon: "🚚" },
  { name: "Hospitality", icon: "🍽️" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">EthioJobs Connect</p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Find local Ethiopian work opportunities with confidence.</h1>
          <p className="text-lg text-slate-300">Search jobs, save openings, apply with your profile, and connect with verified employers across Addis Ababa, Oromia, Amhara, and beyond.</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/jobs" className="rounded-full bg-primary px-8 py-3 text-white transition hover:bg-blue-500">Search Jobs</Link>
            <Link href="/login" className="rounded-full border border-slate-700 px-8 py-3 text-slate-100 transition hover:bg-slate-800">Employer Login</Link>
          </div>
        </div>
      </section>
      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-semibold text-white">Browse by popular cities and categories</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.map((city) => (
              <div key={city.name} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xl">{city.icon}</span>
                  <div>
                    <p className="text-sm text-orange-400">City</p>
                    <h3 className="mt-2 text-xl font-semibold">{city.name}</h3>
                  </div>
                </div>
              </div>
            ))}
            {categories.map((category) => (
              <div key={category.name} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-xl">{category.icon}</span>
                  <div>
                    <p className="text-sm text-cyan-300">Category</p>
                    <h3 className="mt-2 text-xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
