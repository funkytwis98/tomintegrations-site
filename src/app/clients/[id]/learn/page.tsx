"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface UnansweredQuestion {
  id: string;
  call_id: string | null;
  question: string;
  context: string | null;
  status: string;
  answer: string | null;
  created_at: string;
}

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const [pending, setPending] = useState<UnansweredQuestion[]>([]);
  const [answered, setAnswered] = useState<UnansweredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [id]);

  async function loadQuestions() {
    const [pendingRes, answeredRes] = await Promise.all([
      supabase
        .from("unanswered_questions")
        .select("*")
        .eq("client_id", id)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("unanswered_questions")
        .select("*")
        .eq("client_id", id)
        .eq("status", "answered")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (pendingRes.error) {
      toast.error("Failed to load questions");
    } else {
      setPending(pendingRes.data ?? []);
    }
    setAnswered(answeredRes.data ?? []);
    setLoading(false);
  }

  async function teachSarah(q: UnansweredQuestion) {
    const answer = answers[q.id]?.trim();
    if (!answer) {
      toast.error("Please type an answer first");
      return;
    }

    setSavingId(q.id);

    // Create KB entry
    const title =
      q.question.length > 60
        ? q.question.slice(0, 57) + "..."
        : q.question;

    const { data: kbEntry, error: kbErr } = await supabase
      .from("knowledge_base")
      .insert({
        client_id: id,
        category: "faq",
        title,
        content: answer,
        is_active: true,
        priority: 0,
      })
      .select("id")
      .single();

    if (kbErr) {
      toast.error("Failed to add to knowledge base");
      setSavingId(null);
      return;
    }

    // Update unanswered_questions row
    const { error: updateErr } = await supabase
      .from("unanswered_questions")
      .update({
        status: "answered",
        answer,
        added_to_kb: true,
        kb_entry_id: kbEntry.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", q.id);

    if (updateErr) {
      toast.error("Failed to update question");
      setSavingId(null);
      return;
    }

    // Trigger Retell sync so Sarah learns it immediately
    try {
      await fetch("/api/admin/sync-retell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: id }),
      });
    } catch {
      // Non-critical — KB is saved even if sync fails
    }

    toast.success("Sarah learned it! She'll know this on the next call.");
    setPending((prev) => prev.filter((p) => p.id !== q.id));
    setAnswered((prev) => [{ ...q, status: "answered", answer }, ...prev]);
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    setSavingId(null);
  }

  async function dismiss(qId: string) {
    const { error } = await supabase
      .from("unanswered_questions")
      .update({ status: "dismissed", updated_at: new Date().toISOString() })
      .eq("id", qId);

    if (error) {
      toast.error("Failed to dismiss");
    } else {
      toast.success("Dismissed");
      setPending((prev) => prev.filter((p) => p.id !== qId));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Teach Sarah</h1>
        <p className="mt-1 text-sm text-neutral-400">
          These are questions Sarah couldn&apos;t answer on calls. Type the
          correct answer and she&apos;ll learn it for next time.
        </p>
      </div>

      {/* Pending questions */}
      {pending.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-700 p-12 text-center">
          <p className="text-lg text-neutral-400">No pending questions</p>
          <p className="mt-1 text-sm text-neutral-600">
            When Sarah can&apos;t answer something on a call, it&apos;ll show
            up here so you can teach her.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-amber-400/30 bg-neutral-900 p-5 space-y-3"
            >
              <div>
                <p className="text-sm font-medium text-amber-400">
                  Caller asked:
                </p>
                <p className="mt-1 text-neutral-100">
                  &quot;{q.question}&quot;
                </p>
              </div>

              {q.context && (
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Sarah said:
                  </p>
                  <p className="mt-0.5 text-sm text-neutral-400 italic">
                    &quot;{q.context}&quot;
                  </p>
                </div>
              )}

              <p className="text-xs text-neutral-600">
                {new Date(q.created_at).toLocaleString()}
              </p>

              <textarea
                value={answers[q.id] ?? ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [q.id]: e.target.value,
                  }))
                }
                placeholder="Type the correct answer here..."
                rows={3}
                className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => teachSarah(q)}
                  disabled={savingId === q.id}
                  className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
                >
                  {savingId === q.id ? "Teaching..." : "Teach Sarah"}
                </button>
                <button
                  onClick={() => dismiss(q.id)}
                  disabled={savingId === q.id}
                  className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-400 transition-colors hover:text-neutral-200 disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Already taught */}
      {answered.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-neutral-300">
            Already Taught
          </h2>
          <div className="space-y-2">
            {answered.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-300">
                      Q: &quot;{q.question}&quot;
                    </p>
                    <p className="mt-1 text-sm text-green-400/80">
                      A: {q.answer}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                    Learned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
