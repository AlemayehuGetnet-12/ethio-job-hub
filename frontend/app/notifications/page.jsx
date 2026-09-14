"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";

const TYPE_STYLES = {
  info: "border-l-blue-500",
  success: "border-l-emerald-500",
  warning: "border-l-amber-500",
  error: "border-l-rose-500",
};

export default function NotificationsPage() {
  const { user, authHeaders } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    axios.get(getApiUrl("/api/notifications"), { headers: authHeaders() })
      .then(res => { setNotifications(res.data.notifications || []); setLoading(false); })
      .catch(() => { setError("Unable to load notifications."); setLoading(false); });
  }, [user, authHeaders]);

  const markRead = async (id) => {
    try {
      await axios.put(getApiUrl(`/api/notifications/${id}/read`), {}, { headers: authHeaders() });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.readAt);
    await Promise.allSettled(unread.map(n => axios.put(getApiUrl(`/api/notifications/${n._id}/read`), {}, { headers: authHeaders() })));
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
        <p className="text-slate-400">Sign in to view notifications.</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            {unreadCount > 0 && <p className="mt-1 text-sm text-slate-400">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="rounded-full border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
              Mark all read
            </button>
          )}
        </div>

        {error && <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-900" />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            No notifications yet. You'll see application updates and alerts here.
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map(n => (
              <li key={n._id}
                className={`rounded-2xl border border-slate-800 border-l-4 bg-slate-900 p-5 transition ${TYPE_STYLES[n.type] || "border-l-slate-600"} ${!n.readAt ? "bg-slate-800/60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className={`font-medium ${!n.readAt ? "text-white" : "text-slate-300"}`}>{n.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-500">{dualDate(n.createdAt)}</p>
                  </div>
                  {!n.readAt && (
                    <button onClick={() => markRead(n._id)}
                      className="shrink-0 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700">
                      Mark read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
