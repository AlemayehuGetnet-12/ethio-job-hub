"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "../api-config";

export default function TelegramSubscriptions({ className = "" }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState("");
  const [keywords, setKeywords] = useState("");
  const [locations, setLocations] = useState("");
  const [categories, setCategories] = useState("");
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const authHeaders = () => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        setError('You must be signed in to manage subscriptions.');
        setSubscriptions([]);
        return;
      }
      const res = await axios.get(getApiUrl('/api/telegram/list'), { headers: authHeaders() });
      setSubscriptions(res.data.subscriptions || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubscriptions(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!token) throw new Error('Not authenticated');
      const body = {
        chatId: chatId.trim(),
        keywords: keywords.split(',').map(s => s.trim()).filter(Boolean),
        locations: locations.split(',').map(s => s.trim()).filter(Boolean),
        categories: categories.split(',').map(s => s.trim()).filter(Boolean),
      };
      const res = await axios.post(getApiUrl('/api/telegram/subscribe'), body, { headers: authHeaders() });
      if (res?.data?.subscription) {
        setChatId(''); setKeywords(''); setLocations(''); setCategories('');
        await loadSubscriptions();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create subscription');
    } finally { setSaving(false); }
  };

  const handleUnsubscribe = async (cid) => {
    if (!confirm('Unsubscribe this chat?')) return;
    setError(null);
    try {
      await axios.post(getApiUrl('/api/telegram/unsubscribe'), { chatId: cid }, { headers: authHeaders() });
      await loadSubscriptions();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to unsubscribe');
    }
  };

  const [pairCode, setPairCode] = useState(null);
  const [pairLink, setPairLink] = useState(null);
  const [pairing, setPairing] = useState(false);

  const generatePair = async () => {
    setPairing(true);
    setError(null);
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(getApiUrl('/api/telegram/pair/generate'), {}, { headers: authHeaders() });
      setPairCode(res.data.code);
      setPairLink(res.data.deepLink || null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to generate pair code');
    } finally { setPairing(false); }
  };

  const copyCode = () => {
    try { navigator.clipboard.writeText(pairCode); } catch (e) {}
  };

  return (
    <div className={className}>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-lg font-semibold">Telegram job alerts</h3>
        <p className="mt-1 text-sm text-slate-400">Subscribe to job alerts via the Telegram bot. Provide your chat id (or get it from the bot) and optional filters.</p>

        {error && <div className="mt-3 rounded border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">{error}</div>}

        <div className="mt-3 flex items-center gap-3">
          <button onClick={generatePair} disabled={pairing} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">{pairing ? 'Generating...' : 'Link with Telegram bot'}</button>
          <div className="text-sm text-slate-400">Click to get a one-time code you can send to the bot (or open via deep link) to pair your chat.</div>
        </div>

        {pairCode ? (
          <div className="mt-3 rounded border border-slate-800 bg-slate-950 p-3">
            <div className="text-sm text-slate-300">Pairing code (expires in 15 minutes)</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="font-mono text-lg text-slate-100">{pairCode}</div>
              <button onClick={copyCode} className="rounded-full border border-slate-700 px-3 py-1 text-sm">Copy</button>
              {pairLink ? (<a href={pairLink} target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 px-3 py-1 text-sm">Open in Telegram</a>) : null}
            </div>
            <div className="mt-2 text-sm text-slate-400">Send <span className="font-mono">/link {pairCode}</span> to the bot or use the Open in Telegram link.</div>
          </div>
        ) : null}

        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-slate-400">Telegram chat id</label>
            <input value={chatId} onChange={(e)=>setChatId(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none" placeholder="e.g., 123456789" />
          </div>
... (rest unchanged)