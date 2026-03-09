"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface Playbook {
  id: string;
  category: string;
  title: string;
  trigger_phrase: string | null;
  response_script: string;
  is_active: boolean;
  priority: number;
}

const CATEGORIES = [
  { value: "objection_handling", label: "Objection Handling" },
  { value: "upsell_trigger", label: "Upsell Trigger" },
  { value: "urgency_script", label: "Urgency Script" },
  { value: "closing_technique", label: "Closing Technique" },
];

const CATEGORY_COLORS: Record<string, string> = {
  objection_handling: "bg-red-500/20 text-red-400",
  upsell_trigger: "bg-green-500/20 text-green-400",
  urgency_script: "bg-orange-500/20 text-orange-400",
  closing_technique: "bg-blue-500/20 text-blue-400",
};

export default function PlaybookPage() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "objection_handling",
    title: "",
    trigger_phrase: "",
    response_script: "",
    priority: 0,
  });

  useEffect(() => {
    loadEntries();
  }, [id]);

  async function loadEntries() {
    const { data, error } = await supabase
      .from("sales_playbooks")
      .select("*")
      .eq("client_id", id)
      .order("priority", { ascending: false });
    if (error) {
      toast.error("Failed to load playbook");
    } else {
      setEntries(data ?? []);
    }
    setLoading(false);
  }

  async function addEntry() {
    if (!form.title.trim() || !form.response_script.trim()) {
      toast.error("Title and response script are required");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("sales_playbooks")
      .insert({
        client_id: id,
        category: form.category,
        title: form.title,
        trigger_phrase: form.trigger_phrase || null,
        response_script: form.response_script,
        priority: form.priority,
        is_active: true,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Failed to add: " + error.message);
    } else {
      toast.success("Playbook entry added");
      setEntries([data, ...entries]);
      setForm({ category: "objection_handling", title: "", trigger_phrase: "", response_script: "", priority: 0 });
      setShowAdd(false);
    }
  }

  async function updateEntry(entry: Playbook) {
    setSaving(true);
    const { error } = await supabase
      .from("sales_playbooks")
      .update({
        category: entry.category,
        title: entry.title,
        trigger_phrase: entry.trigger_phrase,
        response_script: entry.response_script,
        priority: entry.priority,
        is_active: entry.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Playbook updated");
      setEditingId(null);
    }
  }

  async function deleteEntry(entryId: string) {
    if (!confirm("Delete this playbook entry?")) return;
    const { error } = await supabase.from("sales_playbooks").delete().eq("id", entryId);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Entry deleted");
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  }

  async function toggleActive(entry: Playbook) {
    const newActive = !entry.is_active;
    const { error } = await supabase
      .from("sales_playbooks")
      .update({ is_active: newActive })
      .eq("id", entry.id);
    if (error) {
      toast.error("Failed to toggle");
    } else {
      toast.success(newActive ? "Activated" : "Deactivated");
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, is_active: newActive } : e)));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Playbook</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
        >
          {showAdd ? "Cancel" : "Add Script"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-amber-400/30 bg-neutral-900 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm text-neutral-400">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-neutral-400">Priority</span>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-400">Title</span>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder='e.g. "Too expensive" objection' className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-400">Trigger Phrase (optional)</span>
            <input type="text" value={form.trigger_phrase} onChange={(e) => setForm({ ...form, trigger_phrase: e.target.value })} placeholder="What the caller might say" className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-400">Response Script</span>
            <textarea value={form.response_script} onChange={(e) => setForm({ ...form, response_script: e.target.value })} rows={4} placeholder="What the AI should say" className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600" />
          </label>
          <button onClick={addEntry} disabled={saving} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50">
            {saving ? "Adding..." : "Add Script"}
          </button>
        </div>
      )}

      {entries.length === 0 && !showAdd ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const editing = editingId === entry.id;
            return (
              <div key={entry.id} className={`rounded-lg border p-4 ${entry.is_active ? "border-neutral-800" : "border-neutral-800/50 opacity-60"}`}>
                {editing ? (
                  <EditForm
                    entry={entry}
                    saving={saving}
                    onSave={(updated) => {
                      setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
                      updateEntry(updated);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[entry.category] ?? "bg-neutral-800 text-neutral-400"}`}>
                          {CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category}
                        </span>
                        <h3 className="font-medium">{entry.title}</h3>
                      </div>
                      {entry.trigger_phrase && (
                        <p className="mt-1 text-sm text-amber-400/70">Trigger: &quot;{entry.trigger_phrase}&quot;</p>
                      )}
                      <p className="mt-1 text-sm text-neutral-400 whitespace-pre-wrap">{entry.response_script}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(entry)} className="rounded p-1 text-xs text-neutral-500 hover:text-amber-400">{entry.is_active ? "◉" : "○"}</button>
                      <button onClick={() => setEditingId(entry.id)} className="rounded p-1 text-xs text-neutral-500 hover:text-amber-400">✎</button>
                      <button onClick={() => deleteEntry(entry.id)} className="rounded p-1 text-xs text-neutral-500 hover:text-red-400">✕</button>
                    </div>
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

function EditForm({ entry, saving, onSave, onCancel }: { entry: Playbook; saving: boolean; onSave: (e: Playbook) => void; onCancel: () => void }) {
  const [local, setLocal] = useState(entry);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={local.category} onChange={(e) => setLocal({ ...local, category: e.target.value })} className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input type="number" value={local.priority} onChange={(e) => setLocal({ ...local, priority: parseInt(e.target.value) || 0 })} className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
      </div>
      <input type="text" value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
      <input type="text" value={local.trigger_phrase ?? ""} onChange={(e) => setLocal({ ...local, trigger_phrase: e.target.value })} placeholder="Trigger phrase" className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600" />
      <textarea value={local.response_script} onChange={(e) => setLocal({ ...local, response_script: e.target.value })} rows={4} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
      <div className="flex gap-2">
        <button onClick={() => onSave(local)} disabled={saving} className="rounded bg-amber-400 px-3 py-1.5 text-sm font-semibold text-neutral-950 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
        <button onClick={onCancel} className="rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200">Cancel</button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 p-12 text-center">
      <p className="text-lg text-neutral-400">No sales playbook entries</p>
      <p className="mt-1 text-sm text-neutral-600">
        Add objection handling scripts, upsell triggers, urgency scripts, and closing techniques for your AI receptionist to use during calls.
      </p>
      <button onClick={onAdd} className="mt-4 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-300">
        Add First Script
      </button>
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
