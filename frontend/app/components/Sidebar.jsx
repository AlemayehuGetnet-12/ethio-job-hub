import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 hidden lg:block bg-slate-900 border-r border-slate-800 p-6">
      <nav className="space-y-4">
        <Link href="/dashboard" className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800">Overview</Link>
        <Link href="/dashboard/applicants" className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800">Applicants</Link>
        <Link href="/dashboard/interviews" className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800">Interviews</Link>
        <Link href="/dashboard/analytics" className="block rounded-md px-3 py-2 text-slate-200 hover:bg-slate-800">Analytics</Link>
      </nav>
    </aside>
  );
}