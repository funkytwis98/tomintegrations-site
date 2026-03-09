"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface KBEntry {
  id: string;
  category: string;
  title: string;
  content: string;
  priority: number;
  is_active: boolean;
}

const CATEGORIES = ["services", "pricing", "hours", "policies", "faq", "other"];

export default function KnowledgePage() {
  const { id } = useParams<{ id: string }>();
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: "faq", title: "", content: "", priority: 0 });

  useEffect(() => {
    loadEntries();
  }, [id]);

  async function loadEntries() {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("client_id", id)
      .order("priority", { ascending: false });
    if (error) {
      toast.error("Failed to load knowledge base");
    } else {
      setEntries(data ?? []);
    }
    setLoading(false);
  }

  async function addEntry() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("knowledge_base")
      .insert({ client_id: id, ...form, is_active: true })
      .select()
      .single();
    setSaving(false);
    if (error) {
      toast.error("Failed to add entry: " + error.message);
    } else {
      toast.success("Knowledge entry added");
      setEntries([data, ...entries]);
      setForm({ category: "faq", title: "", content: "", priority: 0 });
      setShowAdd(false);
    }
  }

  async function updateEntry(entry: KBEntry) {
    setSaving(true);
    const { error } = await supabase
      .from("knowledge_base")
      .update({
        category: entry.category,
        title: entry.title,
        content: entry.content,
        priority: entry.priority,
        is_active: entry.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to update entry");
    } else {
      toast.success("Entry updated");
      setEditingId(null);
    }
  }

  async function deleteEntry(entryId: string) {
    if (!confirm("Delete this knowledge entry?")) return;
    const { error } = await supabase.from("knowledge_base").delete().eq("id", entryId);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    }
  }

  async function toggleActive(entry: KBEntry) {
    const newActive = !entry.is_active;
    const { error } = await supabase
      .from("knowledge_base")
      .update({ is_active: newActive })
      .eq("id", entry.id);
    if (error) {
      toast.error("Failed to toggle entry");
    } else {
      toast.success(newActive ? "Entry activated" : "Entry deactivated");
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, is_active: newActive } : e))
      );
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
        >
          {showAdd ? "Cancel" : "Add Entry"}
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
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-neutral-400">Priority</span>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-400">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-neutral-400">Content</span>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={4}
              className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
          </label>
          <button
            onClick={addEntry}
            disabled={saving}
            className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Entry"}
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
              <div
                key={entry.id}
                className={`rounded-lg border p-4 ${
                  entry.is_active ? "border-neutral-800" : "border-neutral-800/50 opacity-60"
                }`}
              >
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
                        <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">{entry.category}</span>
                        <h3 className="font-medium">{entry.title}</h3>
                        {!entry.is_active && <span className="text-xs text-neutral-600">(inactive)</span>}
                      </div>
                      <p className="mt-1 text-sm text-neutral-400 whitespace-pre-wrap">{entry.content}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(entry)} className="rounded p-1 text-xs text-neutral-500 hover:text-amber-400" title={entry.is_active ? "Deactivate" : "Activate"}>
                        {entry.is_active ? "◉" : "○"}
                      </button>
                      <button onClick={() => setEditingId(entry.id)} className="rounded p-1 text-xs text-neutral-500 hover:text-amber-400" title="Edit">
                        ✎
                      </button>
                      <button onClick={() => deleteEntry(entry.id)} className="rounded p-1 text-xs text-neutral-500 hover:text-red-400" title="Delete">
                        ✕
                      </button>
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

function EditForm({ entry, saving, onSave, onCancel }: { entry: KBEntry; saving: boolean; onSave: (e: KBEntry) => void; onCancel: () => void }) {
  const [local, setLocal] = useState(entry);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={local.category} onChange={(e) => setLocal({ ...local, category: e.target.value })} className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={local.priority} onChange={(e) => setLocal({ ...local, priority: parseInt(e.target.value) || 0 })} className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" placeholder="Priority" />
      </div>
      <input type="text" value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
      <textarea value={local.content} onChange={(e) => setLocal({ ...local, content: e.target.value })} rows={4} className="w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400" />
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
      <p className="text-lg text-neutral-400">No knowledge base entries</p>
      <p className="mt-1 text-sm text-neutral-600">
        Add information about your business so your AI receptionist can answer questions accurately.
      </p>
      <button onClick={onAdd} className="mt-4 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-300">
        Add First Entry
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
