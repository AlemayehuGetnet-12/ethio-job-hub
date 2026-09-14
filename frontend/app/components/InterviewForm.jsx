import { useState } from 'react';
import axios from 'axios';
import { getApiUrl } from '../api-config';

export default function InterviewForm({ onScheduled }) {
  const [applicationId, setApplicationId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState('online');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!applicationId || !date || !time) {
      setError('Application ID, date and time are required');
      return;
    }
    const iso = new Date(`${date}T${time}`);
    setLoading(true);
    try {
      const res = await axios.post(getApiUrl(`/api/applications/${applicationId}/interview`), { date: iso.toISOString(), location, mode, notes }, { withCredentials: true });
      setSuccess('Interview scheduled');
      setApplicationId(''); setDate(''); setTime(''); setLocation(''); setNotes('');
      if (onScheduled) onScheduled(res.data.application);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-sm text-rose-400">{error}</div>}
      {success && <div className="text-sm text-emerald-400">{success}</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input value={applicationId} onChange={(e)=>setApplicationId(e.target.value)} placeholder="Application ID" className="rounded-md bg-slate-900 px-3 py-2 outline-none" />
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="rounded-md bg-slate-900 px-3 py-2 outline-none" />
          <input type="time" value={time} onChange={(e)=>setTime(e.target.value)} className="rounded-md bg-slate-900 px-3 py-2 outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select value={mode} onChange={(e)=>setMode(e.target.value)} className="rounded-md bg-slate-900 px-3 py-2 outline-none">
          <option value="online">Online</option>
          <option value="in-person">In-person</option>
          <option value="phone">Phone</option>
        </select>
        <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location (optional)" className="rounded-md bg-slate-900 px-3 py-2 outline-none" />
      </div>
      <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Notes (optional)" className="w-full rounded-md bg-slate-900 px-3 py-2 outline-none" />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded-full bg-primary px-4 py-2 text-white disabled:opacity-60">{loading ? 'Scheduling...' : 'Schedule Interview'}</button>
      </div>
    </form>
  );
}