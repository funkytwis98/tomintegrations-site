"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type InterestOption = "" | "AI Receptionist" | "AI Social Media Manager" | "Combined Package" | "Not sure yet";

type Slot = {
  startISO: string;
  endISO: string;
  display: string;
  dayLabel?: string;
  timeLabel?: string;
};

type FormValues = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  interest: InterestOption;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>> & {
  slot?: string;
};

const initialValues: FormValues = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  interest: "",
  notes: "",
};

function groupSlotsByDay(slots: Slot[]): Array<{ dayLabel: string; items: Slot[] }> {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    const dayLabel = slot.dayLabel ?? slot.display;
    const current = groups.get(dayLabel) ?? [];
    current.push(slot);
    groups.set(dayLabel, current);
  }
  return Array.from(groups.entries()).map(([dayLabel, items]) => ({ dayLabel, items }));
}

/* ── Nav (same as homepage) ─────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="text-white text-sm tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
          Tom Integrations
        </Link>
        <Link
          href="/book"
          className="text-white text-sm px-5 py-2 rounded-[980px] border border-white/25 hover:bg-white/10 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: "rgba(255,255,255,0.08)" }}
        >
          Book a call
        </Link>
      </div>
    </nav>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className="py-8" style={{ background: "#111", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.25)" }}>
          &copy; 2026 Tom Integrations. Chattanooga, TN.
        </p>
      </div>
    </footer>
  );
}

export default function BookPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDayLabel, setSelectedDayLabel] = useState<string>("");
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const response = await fetch("/api/availability");
        const data = (await response.json()) as { ok: boolean; error?: string; slots?: Slot[] };
        if (!response.ok || !data.ok) {
          setSlotsError(data.error ?? "Could not load availability.");
          return;
        }
        if (!cancelled) setSlots(data.slots ?? []);
      } catch {
        if (!cancelled) setSlotsError("Could not load availability. Please refresh and try again.");
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, []);

  const groupedSlots = useMemo(() => groupSlotsByDay(slots), [slots]);
  const activeGroup = useMemo(
    () => groupedSlots.find((g) => g.dayLabel === selectedDayLabel) ?? groupedSlots[0],
    [groupedSlots, selectedDayLabel],
  );

  useEffect(() => {
    if (groupedSlots.length === 0) { setSelectedDayLabel(""); return; }
    if (!groupedSlots.some((g) => g.dayLabel === selectedDayLabel)) {
      setSelectedDayLabel(groupedSlots[0].dayLabel);
    }
  }, [groupedSlots, selectedDayLabel]);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError(null);
  };

  function validate(input: FormValues, slot: Slot | null): FormErrors {
    const e: FormErrors = {};
    if (!slot) e.slot = "Please choose an appointment time.";
    if (!input.fullName.trim()) e.fullName = "Full name is required.";
    if (!input.businessName.trim()) e.businessName = "Business name is required.";
    if (!input.email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) e.email = "Enter a valid email address.";
    if (!input.phone.trim()) e.phone = "Phone is required.";
    else if (input.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number with at least 10 digits.";
    if (!input.interest) e.interest = "Please select what you're interested in.";
    return e;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validate(values, selectedSlot);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, slotStartISO: selectedSlot.startISO, slotEndISO: selectedSlot.endISO }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string; errors?: FormErrors };
      if (response.status === 400 && data.errors) { setErrors((prev) => ({ ...prev, ...data.errors })); return; }
      if (response.status === 409) { setSubmitError(data.error ?? "That slot is no longer available. Please choose another."); setSelectedSlot(null); return; }
      if (!response.ok || !data.ok) { setSubmitError(data.error ?? "Could not complete booking. Please try again."); return; }
      setSuccessMessage("Booking confirmed. Check your email for details.");
      setValues(initialValues);
      setErrors({});
    } catch {
      setSubmitError("Network error. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/[0.07] disabled:opacity-50";

  return (
    <div style={{ background: "#111", minHeight: "100vh" }}>
      <Nav />

      <div className="pt-28 pb-12 px-6 max-w-xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.4)" }}>
          Let&apos;s talk
        </p>
        <h1 className="text-4xl sm:text-5xl text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Book a call with Tom.
        </h1>
        <p className="text-base mb-12" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)" }}>
          Free 10-minute demo. See the AI working on your business — no commitment.
        </p>

        {/* Booking form */}
        <div className="rounded-2xl p-6 sm:p-8 text-left" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {/* Time picker */}
          <h2 className="text-lg text-white mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Choose a time
          </h2>

          {slotsLoading && <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading available slots...</p>}
          {slotsError && <p className="text-sm text-red-400">{slotsError}</p>}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No slots are currently open. Please check back soon.</p>
          )}

          {!slotsLoading && !slotsError && slots.length > 0 && activeGroup && (
            <div className="space-y-3 mb-6">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {groupedSlots.map((group) => {
                  const active = group.dayLabel === activeGroup.dayLabel;
                  return (
                    <button
                      key={group.dayLabel}
                      type="button"
                      onClick={() => { setSelectedDayLabel(group.dayLabel); setSelectedSlot(null); setSuccessMessage(null); }}
                      className="shrink-0 px-4 py-2 rounded-[980px] text-sm transition-colors"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                        color: active ? "#fff" : "rgba(255,255,255,0.5)",
                        border: active ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {group.dayLabel}
                    </button>
                  );
                })}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {activeGroup.items.map((slot) => {
                  const selected = selectedSlot?.startISO === slot.startISO;
                  return (
                    <button
                      key={slot.startISO}
                      type="button"
                      onClick={() => { setSelectedSlot(slot); setErrors((p) => ({ ...p, slot: undefined })); setSuccessMessage(null); }}
                      className="w-full px-4 py-2.5 rounded-xl text-left text-sm transition-colors"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.03)",
                        color: selected ? "#fff" : "rgba(255,255,255,0.6)",
                        border: selected ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {slot.timeLabel ?? slot.display}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {errors.slot && <p className="text-xs text-red-400 mb-4">{errors.slot}</p>}

          {/* Form */}
          {successMessage && (
            <div className="rounded-xl px-4 py-3 text-sm text-white mb-6" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              {successMessage}
            </div>
          )}
          {submitError && (
            <div className="rounded-xl px-4 py-3 text-sm text-red-300 mb-6" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {submitError}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>Full name</label>
              <input type="text" value={values.fullName} onChange={(e) => setField("fullName", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass} />
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>Business name</label>
              <input type="text" value={values.businessName} onChange={(e) => setField("businessName", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass} />
              {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>Email</label>
              <input type="email" value={values.email} onChange={(e) => setField("email", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>Phone</label>
              <input type="tel" value={values.phone} onChange={(e) => setField("phone", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass} />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>What you&apos;re interested in</label>
              <select value={values.interest} onChange={(e) => setField("interest", e.target.value as InterestOption)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass}>
                <option value="">Select one</option>
                <option value="AI Receptionist">AI Receptionist</option>
                <option value="AI Social Media Manager">AI Social Media Manager</option>
                <option value="Combined Package">Combined Package</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
              {errors.interest && <p className="text-xs text-red-400 mt-1">{errors.interest}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>Notes (optional)</label>
              <textarea rows={3} value={values.notes} onChange={(e) => setField("notes", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(successMessage)}
              className="w-full py-3 rounded-[980px] text-sm transition-colors disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, background: "#fff", color: "#111" }}
            >
              {isSubmitting ? "Booking..." : successMessage ? "Booked" : "Confirm booking"}
            </button>
          </form>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
