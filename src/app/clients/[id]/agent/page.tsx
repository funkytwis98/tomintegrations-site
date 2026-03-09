"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface AgentConfig {
  id: string;
  client_id: string;
  agent_name: string | null;
  greeting: string | null;
  personality: string | null;
  sales_style: string | null;
  escalation_rules: string | null;
  voicemail_message: string | null;
  voice_id: string | null;
  language: string | null;
  custom_instructions: string | null;
}

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English Only" },
  { value: "es-ES", label: "Spanish Only" },
  { value: "multi", label: "Bilingual (Auto-detect)" },
];

export default function AgentPage() {
  const { id } = useParams<{ id: string }>();
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("agent_config")
        .select("*")
        .eq("client_id", id)
        .single();

      if (error && error.code === "PGRST116") {
        // No config yet, create a default
        const { data: newConfig, error: insertErr } = await supabase
          .from("agent_config")
          .insert({ client_id: id })
          .select()
          .single();
        if (insertErr) {
          toast.error("Failed to create agent config");
        } else {
          setConfig(newConfig);
        }
      } else if (error) {
        toast.error("Failed to load agent config");
      } else {
        setConfig(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function update(field: keyof AgentConfig, value: string) {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    const { error } = await supabase
      .from("agent_config")
      .update({
        agent_name: config.agent_name,
        greeting: config.greeting,
        personality: config.personality,
        sales_style: config.sales_style,
        escalation_rules: config.escalation_rules,
        voicemail_message: config.voicemail_message,
        voice_id: config.voice_id,
        language: config.language,
        custom_instructions: config.custom_instructions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", config.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Agent config saved");
    }
  }

  async function syncToRetell() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-retell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sync failed");
      toast.success("Synced to Retell successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sync to Retell");
    } finally {
      setSyncing(false);
    }
  }

  if (loading) return <Spinner />;
  if (!config) return <p className="text-neutral-400">Could not load agent configuration.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Voice Agent Settings</h1>
        <button
          onClick={syncToRetell}
          disabled={syncing}
          className="rounded-md border border-amber-400 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync to Retell"}
        </button>
      </div>

      <section className="space-y-4 rounded-lg border border-neutral-800 p-6">
        <Field label="Agent Name" value={config.agent_name ?? ""} onChange={(v) => update("agent_name", v)} />
        <Field label="Voice ID" value={config.voice_id ?? ""} onChange={(v) => update("voice_id", v)} placeholder="e.g. 11labs_voice_id" />

        <label className="block">
          <span className="mb-1 block text-sm text-neutral-400">Language</span>
          <select
            value={config.language ?? "en-US"}
            onChange={(e) => update("language", e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <TextArea label="Greeting" value={config.greeting ?? ""} onChange={(v) => update("greeting", v)} placeholder="What the agent says when it picks up" />
        <TextArea label="Personality" value={config.personality ?? ""} onChange={(v) => update("personality", v)} placeholder="Describe the agent's tone and style" />
        <TextArea label="Sales Style" value={config.sales_style ?? ""} onChange={(v) => update("sales_style", v)} placeholder="How should the agent handle sales?" />
        <TextArea label="Escalation Rules" value={config.escalation_rules ?? ""} onChange={(v) => update("escalation_rules", v)} placeholder="When should the agent transfer the call?" />
        <TextArea label="Voicemail Message" value={config.voicemail_message ?? ""} onChange={(v) => update("voicemail_message", v)} placeholder="Message to leave if no answer" />
        <TextArea label="Custom Instructions" value={config.custom_instructions ?? ""} onChange={(v) => update("custom_instructions", v)} placeholder="Any additional instructions" rows={6} />

        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Agent Settings"}
        </button>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-400">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600"
      />
    </label>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-amber-400" />
    </div>
  );
}
