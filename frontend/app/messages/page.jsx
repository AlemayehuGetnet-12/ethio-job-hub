"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { getApiUrl } from "../api-config";
import { dualDate } from "../utils/ethiopianCalendar";

export default function MessagesPage() {
  const { user, authHeaders } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    axios.get(getApiUrl("/api/messages/conversations"), { headers: authHeaders() })
      .then(res => { setConversations(res.data.conversations || []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [user, authHeaders]);

  useEffect(() => {
    if (!activeConv) return;
    axios.get(getApiUrl(`/api/messages/conversations/${activeConv}`), { headers: authHeaders() })
      .then(res => {
        setMessages(res.data.messages || []);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
  }, [activeConv, authHeaders]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await axios.post(
        getApiUrl("/api/messages"),
        { recipientId: activeConv, content: newMessage.trim() },
        { headers: authHeaders() }
      );
      setMessages(prev => [...prev, res.data.message]);
      setNewMessage("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

      // refresh conversations list
      const convRes = await axios.get(getApiUrl("/api/messages/conversations"), { headers: authHeaders() });
      setConversations(convRes.data.conversations || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100">
        <p className="text-slate-400">Sign in to view messages.</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Sign in</Link>
      </div>
    );
  }

  const activeContact = conversations.find(c => c.userId === activeConv || c.user?._id === activeConv);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-3xl font-semibold">Messages</h1>

        {error && <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}

        <div className="grid gap-4 lg:grid-cols-[280px_1fr] h-[600px]">
          {/* Conversations list */}
          <aside className="rounded-3xl border border-slate-800 bg-slate-900 overflow-y-auto">
            <div className="p-4 border-b border-slate-800">
              <h2 className="font-semibold text-sm text-slate-300">Conversations</h2>
            </div>
            {loading ? (
              <div className="p-4 text-sm text-slate-400">Loading…</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-sm text-slate-400">No conversations yet.</div>
            ) : (
              <ul>
                {conversations.map(conv => (
                  <li key={conv.userId || conv.user?._id}>
                    <button
                      onClick={() => { setActiveConv(conv.userId || conv.user?._id); setError(null); }}
                      className={`w-full text-left px-4 py-3 transition hover:bg-slate-800 ${(conv.userId || conv.user?._id) === activeConv ? "bg-slate-800" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-white">
                          {(conv.userName || conv.user?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-sm">{conv.userName || conv.user?.name || "User"}</p>
                          <p className="truncate text-xs text-slate-500">{conv.lastMessage || ""}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">{conv.unreadCount}</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Chat area */}
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
            {!activeConv ? (
              <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
                Select a conversation to start messaging.
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="border-b border-slate-800 px-5 py-4 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-white">
                    {(activeContact?.userName || activeContact?.user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold">{activeContact?.userName || activeContact?.user?.name || "User"}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(msg => {
                    const isMe = msg.sender?._id === user.id || msg.sender === user.id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-primary text-white" : "bg-slate-800 text-slate-100"}`}>
                          <p>{msg.content}</p>
                          <p className={`mt-1 text-xs ${isMe ? "text-blue-200" : "text-slate-500"}`}>
                            {dualDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="border-t border-slate-800 p-4 flex gap-3">
                  <input
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-primary"
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-500">
                    {sending ? "…" : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
