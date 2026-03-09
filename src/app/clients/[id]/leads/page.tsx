"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  service_interested: string | null;
  notes: string | null;
  urgency: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400",
  contacted: "bg-yellow-500/20 text-yellow-400",
  booked: "bg-green-500/20 text-green-400",
  completed: "bg-neutral-500/20 text-neutral-400",
  lost: "bg-red-500/20 text-red-400",
};

const URGENCY_COLORS: Record<string, string> = {
  low: "text-neutral-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

export default function LeadsPage() {
  const { id } = useParams<{ id: string }>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, [id]);

  async function loadLeads() {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load leads");
    } else {
      setLeads(data ?? []);
    }
    setLoading(false);
  }

  async function updateStatus(leadId: string, status: string) {
    setUpdatingId(leadId);
    const { error } = await supabase
      .from("leads")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", leadId);
    setUpdatingId(null);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Lead status updated");
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    }
  }

  async function deleteLead(leadId: string) {
    if (!confirm("Delete this lead?")) return;
    setUpdatingId(leadId);
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    setUpdatingId(null);
    if (error) {
      toast.error("Failed to delete lead");
    } else {
      toast.success("Lead deleted");
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Leads</h1>

      {leads.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-neutral-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{lead.name || "Unknown"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? ""}`}>
                      {lead.status}
                    </span>
                    <span className={`text-xs ${URGENCY_COLORS[lead.urgency] ?? ""}`}>
                      {lead.urgency} urgency
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-neutral-400">
                    {lead.phone && <span>{lead.phone}</span>}
                    {lead.email && <span>{lead.email}</span>}
                    {lead.service_interested && <span>Interested in: {lead.service_interested}</span>}
                  </div>
                  {lead.notes && <p className="mt-2 text-sm text-neutral-500">{lead.notes}</p>}
                  <p className="mt-1 text-xs text-neutral-600">{new Date(lead.created_at).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    disabled={updatingId === lead.id}
                    className="rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-300 outline-none focus:border-amber-400 disabled:opacity-50"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="booked">Booked</option>
                    <option value="completed">Completed</option>
                    <option value="lost">Lost</option>
                  </select>
                  <button
                    onClick={() => deleteLead(lead.id)}
                    disabled={updatingId === lead.id}
                    className="rounded p-1 text-neutral-500 transition-colors hover:text-red-400 disabled:opacity-50"
                    title="Delete lead"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-neutral-700 p-12 text-center">
      <p className="text-lg text-neutral-400">No leads yet</p>
      <p className="mt-1 text-sm text-neutral-600">
        Leads will appear here automatically when your AI receptionist captures caller information.
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
