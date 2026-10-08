"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, RefreshCw, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function FailedEmailsPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    fetchFailedEmails();
  }, []);

  const fetchFailedEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employer/emails/failed");
      const data = await res.json();
      if (data.success) {
        setEmails(data.emails || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (emailId: string) => {
    setRetryingId(emailId);
    try {
      const res = await fetch("/api/employer/emails/failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchFailedEmails();
      } else {
        alert(data.error || "Retry failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Failed Outbox Emails</h1>
          <p className="text-xs text-slate-500 mt-1">Review undelivered system emails and trigger real delivery retries.</p>
        </div>
        <button onClick={fetchFailedEmails} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading failed email logs...</div>
      ) : emails.length > 0 ? (
        <div className="space-y-3">
          {emails.map((e) => (
            <div key={e.id} className="p-5 rounded-2xl border border-rose-200 bg-white shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Mail size={16} className="text-rose-500" />
                  To: {e.to}
                </div>
                <div className="font-semibold text-slate-700">Subject: {e.subject}</div>
                <div className="text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 font-mono text-[11px] mt-2">
                  Error: {e.errorMessage || "Unknown dispatch failure"}
                </div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Created: {new Date(e.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => handleRetry(e.id)}
                disabled={retryingId === e.id}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 self-start md:self-auto"
              >
                {retryingId === e.id ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />} Retry Delivery
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
          <h3 className="font-bold text-base text-slate-900">No Failed Outbox Emails</h3>
          <p className="text-xs text-slate-500 mt-1">All dispatched notification and offer emails were delivered cleanly.</p>
        </div>
      )}
    </div>
  );
}
