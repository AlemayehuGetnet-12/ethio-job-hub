import Link from "next/link";
import dynamic from 'next/dynamic';

const TelegramSubscriptions = dynamic(() => import('../components/TelegramSubscriptions'), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-xl shadow-slate-950/20">
          <h1 className="text-4xl font-semibold">My dashboard</h1>
          <p className="mt-3 text-slate-400">A place for tracking your saved jobs, applications, and profile details.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Link href="/jobs" className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-primary">
              <h2 className="text-xl font-semibold">Browse jobs</h2>
              <p className="mt-2 text-slate-400">Search available positions from Ethiopian employers.</p>
            </Link>
            <Link href="/login" className="rounded-3xl border border-slate-800 bg-slate-950 p-6 transition hover:border-primary">
              <h2 className="text-xl font-semibold">Application history</h2>
              <p className="mt-2 text-slate-400">Review your applications and employer messages.</p>
            </Link>
          </div>

          {/* Telegram subscriptions widget (embedded in dashboard) */}
          <div className="mt-8">
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <h2 className="text-xl font-semibold">Alerts & integrations</h2>
              <p className="mt-2 text-slate-400">Manage Telegram job alerts and other integrations.</p>
              <div className="mt-4">
              {/* Lazy-loaded Telegram subscriptions management UI */}
              <TelegramSubscriptions />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
