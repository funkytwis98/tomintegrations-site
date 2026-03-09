"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  slug: string;
  phone_number: string | null;
  retell_agent_id: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  timezone: string | null;
  business_hours: Record<string, { open: string | null; close: string | null }> | null;
  location: string | null;
  services: string | null;
  hours: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
}

interface QuickSettings {
  greeting: string;
  ownerPhone: string;
  agentActive: boolean;
  weekdayOpen: string;
  weekdayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
}

export default function ClientOverview() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ calls: 0, leads: 0, kb: 0 });
  const [pendingQuestions, setPendingQuestions] = useState(0);
  const [quick, setQuick] = useState<QuickSettings>({
    greeting: "",
    ownerPhone: "",
    agentActive: true,
    weekdayOpen: "07:30",
    weekdayClose: "17:30",
    saturdayOpen: "08:00",
    saturdayClose: "14:00",
  });
  const [quickSaving, setQuickSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        toast.error("Failed to load client");
        setLoading(false);
        return;
      }
      setClient(data);

      // Load agent config for greeting
      const { data: agentConfig } = await supabase
        .from("agent_config")
        .select("greeting")
        .eq("client_id", id)
        .single();

      const bh = data.business_hours ?? {};
      setQuick({
        greeting: agentConfig?.greeting ?? "",
        ownerPhone: data.owner_phone ?? "",
        agentActive: (data.settings as Record<string, unknown>)?.agent_active !== false,
        weekdayOpen: bh.monday?.open ?? "07:30",
        weekdayClose: bh.monday?.close ?? "17:30",
        saturdayOpen: bh.saturday?.open ?? "08:00",
        saturdayClose: bh.saturday?.close ?? "14:00",
      });

      const [calls, leads, kb] = await Promise.all([
        supabase.from("calls").select("id", { count: "exact", head: true }).eq("client_id", id),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("client_id", id),
        supabase.from("knowledge_base").select("id", { count: "exact", head: true }).eq("client_id", id),
      ]);
      setStats({
        calls: calls.count ?? 0,
        leads: leads.count ?? 0,
        kb: kb.count ?? 0,
      });

      const { count: pqCount } = await supabase
        .from("unanswered_questions")
        .select("id", { count: "exact", head: true })
        .eq("client_id", id)
        .eq("status", "pending");
      setPendingQuestions(pqCount ?? 0);

      setLoading(false);
    }
    load();
  }, [id]);

  const triggerSync = useCallback(async () => {
    try {
      await fetch("/api/admin/sync-retell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: id }),
      });
    } catch {
      // Non-critical
    }
  }, [id]);

  async function saveGreeting() {
    setQuickSaving("greeting");
    const { error } = await supabase
      .from("agent_config")
      .update({ greeting: quick.greeting, updated_at: new Date().toISOString() })
      .eq("client_id", id);
    setQuickSaving(null);
    if (error) {
      toast.error("Failed to save greeting");
    } else {
      toast.success("Greeting saved");
      triggerSync();
    }
  }

  async function saveOwnerPhone() {
    setQuickSaving("ownerPhone");
    const { error } = await supabase
      .from("clients")
      .update({ owner_phone: quick.ownerPhone })
      .eq("id", id);
    setQuickSaving(null);
    if (error) {
      toast.error("Failed to save phone");
    } else {
      toast.success("Owner phone saved");
      if (client) setClient({ ...client, owner_phone: quick.ownerPhone });
    }
  }

  async function saveHours() {
    setQuickSaving("hours");
    const business_hours = {
      monday: { open: quick.weekdayOpen, close: quick.weekdayClose },
      tuesday: { open: quick.weekdayOpen, close: quick.weekdayClose },
      wednesday: { open: quick.weekdayOpen, close: quick.weekdayClose },
      thursday: { open: quick.weekdayOpen, close: quick.weekdayClose },
      friday: { open: quick.weekdayOpen, close: quick.weekdayClose },
      saturday: { open: quick.saturdayOpen, close: quick.saturdayClose },
      sunday: { open: null, close: null },
    };
    const { error } = await supabase
      .from("clients")
      .update({ business_hours })
      .eq("id", id);
    setQuickSaving(null);
    if (error) {
      toast.error("Failed to save hours");
    } else {
      toast.success("Business hours saved");
      if (client) setClient({ ...client, business_hours });
      triggerSync();
    }
  }

  async function toggleAgentActive() {
    const newVal = !quick.agentActive;
    setQuick((prev) => ({ ...prev, agentActive: newVal }));
    setQuickSaving("toggle");
    const settings = { ...(client?.settings ?? {}), agent_active: newVal };
    const { error } = await supabase
      .from("clients")
      .update({ settings })
      .eq("id", id);
    setQuickSaving(null);
    if (error) {
      toast.error("Failed to toggle agent");
      setQuick((prev) => ({ ...prev, agentActive: !newVal }));
    } else {
      toast.success(newVal ? "Agent activated" : "Agent deactivated");
      if (client) setClient({ ...client, settings });
    }
  }

  async function save() {
    if (!client) return;
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({
        name: client.name,
        owner_name: client.owner_name,
        owner_phone: client.owner_phone,
        owner_email: client.owner_email,
        phone_number: client.phone_number,
        timezone: client.timezone,
        location: client.location,
        services: client.services,
        hours: client.hours,
      })
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("Client updated");
    }
  }

  if (loading) return <Spinner />;
  if (!client) return <p className="text-neutral-400">Client not found.</p>;

  return (
    <div className="max-w-3xl space-y-8">
      {pendingQuestions > 0 && (
        <Link
          href={`/clients/${id}/learn`}
          className="flex items-center gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 transition-colors hover:bg-amber-400/15"
        >
          <span className="text-2xl">📚</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">
              Knowledge Base Opportunity
            </p>
            <p className="text-sm text-amber-200/70">
              Sarah didn&apos;t know how to answer {pendingQuestions} question{pendingQuestions !== 1 ? "s" : ""} from recent calls.{" "}
              <span className="font-medium text-amber-300">Teach her now →</span>
            </p>
          </div>
        </Link>
      )}

      {/* Quick Settings */}
      <section className="rounded-lg border border-neutral-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <h2 className="text-lg font-semibold">Quick Settings</h2>
        </div>

        {/* Agent Active toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-200">Agent Active</p>
            <p className="text-xs text-neutral-500">Turn Sarah on or off for incoming calls</p>
          </div>
          <button
            onClick={toggleAgentActive}
            disabled={quickSaving === "toggle"}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              quick.agentActive ? "bg-amber-400" : "bg-neutral-700"
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                quick.agentActive ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <hr className="border-neutral-800" />

        {/* Greeting */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-200">Greeting</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quick.greeting}
              onChange={(e) => setQuick((p) => ({ ...p, greeting: e.target.value }))}
              placeholder="What Sarah says when she picks up"
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600"
            />
            <button
              onClick={saveGreeting}
              disabled={quickSaving === "greeting"}
              className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {quickSaving === "greeting" ? "..." : "Save"}
            </button>
          </div>
        </div>

        {/* Business Hours */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-200">Business Hours</label>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-neutral-500 w-12">Mon-Fri</span>
            <input
              type="time"
              value={quick.weekdayOpen}
              onChange={(e) => setQuick((p) => ({ ...p, weekdayOpen: e.target.value }))}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
            <span className="text-xs text-neutral-500">to</span>
            <input
              type="time"
              value={quick.weekdayClose}
              onChange={(e) => setQuick((p) => ({ ...p, weekdayClose: e.target.value }))}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-neutral-500 w-12">Sat</span>
            <input
              type="time"
              value={quick.saturdayOpen}
              onChange={(e) => setQuick((p) => ({ ...p, saturdayOpen: e.target.value }))}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
            <span className="text-xs text-neutral-500">to</span>
            <input
              type="time"
              value={quick.saturdayClose}
              onChange={(e) => setQuick((p) => ({ ...p, saturdayClose: e.target.value }))}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none focus:border-amber-400"
            />
            <button
              onClick={saveHours}
              disabled={quickSaving === "hours"}
              className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {quickSaving === "hours" ? "..." : "Save"}
            </button>
          </div>
          <p className="text-xs text-neutral-600">Sunday: Closed</p>
        </div>

        <hr className="border-neutral-800" />

        {/* Owner Phone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-200">Owner Phone</label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={quick.ownerPhone}
              onChange={(e) => setQuick((p) => ({ ...p, ownerPhone: e.target.value }))}
              placeholder="+1 555-123-4567"
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400 placeholder:text-neutral-600"
            />
            <button
              onClick={saveOwnerPhone}
              disabled={quickSaving === "ownerPhone"}
              className="rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {quickSaving === "ownerPhone" ? "..." : "Save"}
            </button>
          </div>
        </div>
      </section>

      <h1 className="text-2xl font-bold">{client.name}</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Calls" value={stats.calls} />
        <StatCard label="Leads" value={stats.leads} />
        <StatCard label="KB Articles" value={stats.kb} />
      </div>

      {/* Editable fields */}
      <section className="space-y-4 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold">Business Info</h2>
        <Field label="Business Name" value={client.name} onChange={(v) => setClient({ ...client, name: v })} />
        <Field label="Phone Number" value={client.phone_number ?? ""} onChange={(v) => setClient({ ...client, phone_number: v })} />
        <Field label="Location" value={client.location ?? ""} onChange={(v) => setClient({ ...client, location: v })} />
        <Field label="Services" value={client.services ?? ""} onChange={(v) => setClient({ ...client, services: v })} />
        <Field label="Hours" value={client.hours ?? ""} onChange={(v) => setClient({ ...client, hours: v })} />
        <Field label="Timezone" value={client.timezone ?? ""} onChange={(v) => setClient({ ...client, timezone: v })} />

        <h2 className="mt-6 text-lg font-semibold">Owner Info</h2>
        <Field label="Owner Name" value={client.owner_name ?? ""} onChange={(v) => setClient({ ...client, owner_name: v })} />
        <Field label="Owner Phone" value={client.owner_phone ?? ""} onChange={(v) => setClient({ ...client, owner_phone: v })} />
        <Field label="Owner Email" value={client.owner_email ?? ""} onChange={(v) => setClient({ ...client, owner_email: v })} />

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      {/* Read-only info */}
      <section className="rounded-lg border border-neutral-800 p-6 text-sm text-neutral-400 space-y-1">
        <p><span className="text-neutral-300">Subscription:</span> {client.subscription_tier} ({client.subscription_status})</p>
        <p><span className="text-neutral-300">Retell Agent:</span> {client.retell_agent_id ?? "Not configured"}</p>
        <p><span className="text-neutral-300">Created:</span> {new Date(client.created_at).toLocaleDateString()}</p>
      </section>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400"
      />
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 p-4 text-center">
      <p className="text-2xl font-bold text-amber-400">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
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
