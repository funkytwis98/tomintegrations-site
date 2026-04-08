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

  const inputCls =
    "w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[15px] text-white/90 outline-none transition-all duration-200 placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.06] disabled:opacity-40";

  return (
    <div className="min-h-dvh bg-[#111]">
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div className="max-w-[980px] mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-white/90 text-[13px] tracking-tight font-medium">
            Tom Integrations
          </Link>
          <Link href="/book" className="pill pill-ghost !text-[13px] !py-2 !px-5">
            Book a call
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-32 pb-6 px-6 max-w-[520px] mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-medium mb-5">
          Let&rsquo;s talk
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,3.2rem)] leading-[1.08] tracking-[-0.02em] text-white mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Book a call with Tom.
        </h1>
        <p className="text-[16px] leading-relaxed text-white/40 mb-14">
          Free 10-minute demo. See the AI working on your business&nbsp;&mdash; no commitment.
        </p>
      </div>

      {/* Form card */}
      <div className="px-6 pb-20 max-w-[520px] mx-auto">
        <div
          className="rounded-[24px] p-7 sm:p-9"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 32px 80px -24px rgba(0,0,0,0.4)",
          }}
        >
          {/* Time picker */}
          <h2
            className="text-[17px] text-white/80 mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Choose a time
          </h2>

          {slotsLoading && (
            <p className="text-[14px] text-white/30 mb-6">Loading available slots&hellip;</p>
          )}
          {slotsError && (
            <p className="text-[14px] text-red-400/80 mb-6">{slotsError}</p>
          )}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <p className="text-[14px] text-white/30 mb-6">No slots are currently open. Please check back soon.</p>
          )}

          {!slotsLoading && !slotsError && slots.length > 0 && activeGroup && (
            <div className="space-y-3 mb-8">
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {groupedSlots.map((group) => {
                  const active = group.dayLabel === activeGroup.dayLabel;
                  return (
                    <button
                      key={group.dayLabel}
                      type="button"
                      onClick={() => { setSelectedDayLabel(group.dayLabel); setSelectedSlot(null); setSuccessMessage(null); }}
                      className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200"
                      style={{
                        background: active ? "rgba(255,255,255,0.12)" : "transparent",
                        color: active ? "#fff" : "rgba(255,255,255,0.4)",
                        border: active
                          ? "1px solid rgba(255,255,255,0.2)"
                          : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {group.dayLabel}
                    </button>
                  );
                })}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {activeGroup.items.map((slot) => {
                  const selected = selectedSlot?.startISO === slot.startISO;
                  return (
                    <button
                      key={slot.startISO}
                      type="button"
                      onClick={() => { setSelectedSlot(slot); setErrors((p) => ({ ...p, slot: undefined })); setSuccessMessage(null); }}
                      className="w-full px-4 py-3 rounded-2xl text-left text-[14px] transition-all duration-200"
                      style={{
                        background: selected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.02)",
                        color: selected ? "#fff" : "rgba(255,255,255,0.5)",
                        border: selected
                          ? "1px solid rgba(255,255,255,0.25)"
                          : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {slot.timeLabel ?? slot.display}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {errors.slot && <p className="text-[12px] text-red-400/80 mb-5">{errors.slot}</p>}

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-7" />

          {/* Alerts */}
          {successMessage && (
            <div
              className="rounded-2xl px-5 py-4 text-[14px] text-white/80 mb-6"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {successMessage}
            </div>
          )}
          {submitError && (
            <div
              className="rounded-2xl px-5 py-4 text-[14px] text-red-300/80 mb-6"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
            >
              {submitError}
            </div>
          )}

          {/* Form fields */}
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">Full name</label>
              <input type="text" value={values.fullName} onChange={(e) => setField("fullName", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls} />
              {errors.fullName && <p className="text-[12px] text-red-400/80 mt-1.5">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">Business name</label>
              <input type="text" value={values.businessName} onChange={(e) => setField("businessName", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls} />
              {errors.businessName && <p className="text-[12px] text-red-400/80 mt-1.5">{errors.businessName}</p>}
            </div>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">Email</label>
              <input type="email" value={values.email} onChange={(e) => setField("email", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls} />
              {errors.email && <p className="text-[12px] text-red-400/80 mt-1.5">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">Phone</label>
              <input type="tel" value={values.phone} onChange={(e) => setField("phone", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls} />
              {errors.phone && <p className="text-[12px] text-red-400/80 mt-1.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">What you&rsquo;re interested in</label>
              <select value={values.interest} onChange={(e) => setField("interest", e.target.value as InterestOption)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls}>
                <option value="">Select one</option>
                <option value="AI Receptionist">AI Receptionist</option>
                <option value="AI Social Media Manager">AI Social Media Manager</option>
                <option value="Combined Package">Combined Package</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
              {errors.interest && <p className="text-[12px] text-red-400/80 mt-1.5">{errors.interest}</p>}
            </div>
            <div>
              <label className="block text-[13px] text-white/40 mb-2">Notes (optional)</label>
              <textarea rows={3} value={values.notes} onChange={(e) => setField("notes", e.target.value)} disabled={isSubmitting || Boolean(successMessage)} className={inputCls} />
            </div>
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || Boolean(successMessage)}
                className="pill pill-white w-full text-center !py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Booking\u2026" : successMessage ? "Booked" : "Confirm booking"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-7 bg-[#111]" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <p className="text-[12px] text-white/20 tracking-wide">
            &copy; 2026 Tom Integrations. Chattanooga, TN.
          </p>
        </div>
      </footer>
    </div>
  );
}
