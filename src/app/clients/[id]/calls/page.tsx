"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface Call {
  id: string;
  retell_call_id: string | null;
  direction: string;
  caller_number: string | null;
  caller_name: string | null;
  status: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  summary: string | null;
  recording_url: string | null;
  sentiment: string | null;
  lead_score: number | null;
  created_at: string;
}

export default function CallsPage() {
  const { id } = useParams<{ id: string }>();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load calls");
      } else {
        setCalls(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function formatDuration(sec: number | null) {
    if (!sec) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Call History</h1>

      {calls.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {calls.map((call) => {
            const expanded = expandedId === call.id;
            return (
              <div key={call.id} className="rounded-lg border border-neutral-800 overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : call.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-neutral-900/50"
                >
                  <span className={`text-xs font-medium uppercase ${call.direction === "inbound" ? "text-green-400" : "text-blue-400"}`}>
                    {call.direction === "inbound" ? "IN" : "OUT"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {call.caller_name || call.caller_number || "Unknown"}
                    </p>
                    {call.summary && (
                      <p className="mt-0.5 truncate text-sm text-neutral-500">{call.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    {call.sentiment && (
                      <span className={`text-xs ${
                        call.sentiment === "positive" ? "text-green-400" :
                        call.sentiment === "negative" ? "text-red-400" : "text-neutral-400"
                      }`}>
                        {call.sentiment}
                      </span>
                    )}
                    {call.lead_score && (
                      <span className="text-xs text-amber-400">Score: {call.lead_score}/10</span>
                    )}
                    <span>{formatDuration(call.duration_seconds)}</span>
                    <span className="text-xs">{new Date(call.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-neutral-600">{expanded ? "▲" : "▼"}</span>
                </button>

                {expanded && (
                  <div className="border-t border-neutral-800 bg-neutral-900/30 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Caller:</span>{" "}
                        <span className="text-neutral-200">{call.caller_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Number:</span>{" "}
                        <span className="text-neutral-200">{call.caller_number || "—"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Duration:</span>{" "}
                        <span className="text-neutral-200">{formatDuration(call.duration_seconds)}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Status:</span>{" "}
                        <span className="text-neutral-200">{call.status ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Date:</span>{" "}
                        <span className="text-neutral-200">{new Date(call.created_at).toLocaleString()}</span>
                      </div>
                      {call.retell_call_id && (
                        <div>
                          <span className="text-neutral-500">Retell ID:</span>{" "}
                          <span className="text-neutral-200 text-xs">{call.retell_call_id}</span>
                        </div>
                      )}
                    </div>

                    {call.summary && (
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Summary</p>
                        <p className="text-sm text-neutral-300">{call.summary}</p>
                      </div>
                    )}

                    {call.recording_url && (
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Recording</p>
                        <audio controls className="w-full" preload="none">
                          <source src={call.recording_url} />
                          Your browser does not support audio playback.
                        </audio>
                      </div>
                    )}

                    {call.transcript && (
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Transcript</p>
                        <div className="max-h-80 overflow-y-auto rounded border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-300 whitespace-pre-wrap">
                          {call.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 p-12 text-center">
      <p className="text-lg text-neutral-400">No calls yet</p>
      <p className="mt-1 text-sm text-neutral-600">
        Calls will appear here once your AI receptionist starts taking calls. Make sure your Retell agent is configured and your phone number is active.
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-amber-400" />
    </div>
  );
}
