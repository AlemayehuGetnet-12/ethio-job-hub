"use client";

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Card from '../../components/Card';
import InterviewForm from '../../components/InterviewForm';
import axios from 'axios';
import { getApiUrl } from '../../api-config';

export default function InterviewsPage() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const me = await axios.get(getApiUrl('/api/auth/me'), { withCredentials: true });
      setUser(me.data.user);
      const iv = await axios.get(getApiUrl('/api/applications/interviews'), { withCredentials: true });
      setInterviews(iv.data.interviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <h1 className="text-3xl font-semibold">Interviews</h1>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <h3 className="text-lg font-semibold">Schedule interview</h3>
                <p className="mt-2 text-slate-400 text-sm">Quickly schedule interviews by application id. Candidate will receive a notification and email if configured.</p>
                <div className="mt-4">
                  <InterviewForm onScheduled={(app)=>{ setInterviews(prev=>[app, ...prev]); }} />
                </div>
              </Card>

              <div className="lg:col-span-2">
                <Card>
                  <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
                  <div className="mt-4 space-y-3">
                    {loading ? (<div className="text-slate-400">Loading...</div>) : (
                      interviews.length === 0 ? (
                        <div className="text-slate-400">No interviews scheduled</div>
                      ) : (
                        interviews.map((iv) => (
                          <div key={iv._id} className="flex items-center justify-between rounded-md border border-slate-800 p-3">
                            <div>
                              <div className="text-sm text-slate-300">{iv.applicant?.name || 'Candidate'}</div>
                              <div className="text-sm text-slate-400">{iv.job?.title || 'Job'}</div>
                              <div className="text-xs text-slate-500">{iv.interview?.date ? new Date(iv.interview.date).toLocaleString() : '-'}</div>
                            </div>
                            <div className="text-sm text-slate-400">{iv.interview?.mode || '-'}</div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}