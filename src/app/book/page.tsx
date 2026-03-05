"use client";

import { useEffect, useMemo, useState } from "react";

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
        const data = (await response.json()) as {
          ok: boolean;
          error?: string;
          slots?: Slot[];
        };
        if (!response.ok || !data.ok) {
          setSlotsError(data.error ?? "Could not load availability.");
          return;
        }
        if (!cancelled) {
          setSlots(data.slots ?? []);
        }
      } catch {
        if (!cancelled) {
          setSlotsError("Could not load availability. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    loadSlots();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedSlots = useMemo(() => groupSlotsByDay(slots), [slots]);
  const activeGroup = useMemo(
    () => groupedSlots.find((group) => group.dayLabel === selectedDayLabel) ?? groupedSlots[0],
    [groupedSlots, selectedDayLabel],
  );

  useEffect(() => {
    if (groupedSlots.length === 0) {
      setSelectedDayLabel("");
      return;
    }
    if (!groupedSlots.some((group) => group.dayLabel === selectedDayLabel)) {
      setSelectedDayLabel(groupedSlots[0].dayLabel);
    }
  }, [groupedSlots, selectedDayLabel]);

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  function validate(input: FormValues, slot: Slot | null): FormErrors {
    const nextErrors: FormErrors = {};
    if (!slot) {
      nextErrors.slot = "Please choose an appointment time.";
    }
    if (!input.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }
    if (!input.businessName.trim()) {
      nextErrors.businessName = "Business name is required.";
    }
    if (!input.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!input.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    } else if (input.phone.replace(/\D/g, "").length < 10) {
      nextErrors.phone = "Enter a valid phone number with at least 10 digits.";
    }
    if (!input.interest) {
      nextErrors.interest = "Please select what you're interested in.";
    }
    return nextErrors;
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    const nextErrors = validate(values, selectedSlot);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedSlot) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          slotStartISO: selectedSlot.startISO,
          slotEndISO: selectedSlot.endISO,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        errors?: FormErrors;
      };

      if (response.status === 400 && data.errors) {
        setErrors((prev) => ({ ...prev, ...data.errors }));
        return;
      }

      if (response.status === 409) {
        setSubmitError(data.error ?? "That slot is no longer available. Please choose another.");
        setSelectedSlot(null);
        return;
      }

      if (!response.ok || !data.ok) {
        setSubmitError(data.error ?? "Could not complete booking. Please try again.");
        return;
      }

      setSuccessMessage("Booking confirmed. Check your email for details.");
      setValues(initialValues);
      setErrors({});
    } catch {
      setSubmitError("Network error. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
        <h1 className="text-3xl font-semibold">Book a Demo</h1>
        <p className="mt-2 text-neutral-300">
          Pick an available time and share your details. We&apos;ll send a confirmation email right after booking.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-amber-300">Choose a time</h2>
        {slotsLoading && <p className="mt-4 text-sm text-neutral-400">Loading available slots...</p>}
        {slotsError && <p className="mt-4 text-sm text-red-400">{slotsError}</p>}
        {!slotsLoading && !slotsError && slots.length === 0 && (
          <p className="mt-4 text-sm text-neutral-400">No slots are currently open. Please check back soon.</p>
        )}

        {!slotsLoading && !slotsError && slots.length > 0 && activeGroup && (
          <div className="mt-5 space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {groupedSlots.map((group) => {
                const isActiveDay = group.dayLabel === activeGroup.dayLabel;
                return (
                  <button
                    key={group.dayLabel}
                    type="button"
                    onClick={() => {
                      setSelectedDayLabel(group.dayLabel);
                      setSelectedSlot(null);
                      setSuccessMessage(null);
                    }}
                    className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                      isActiveDay
                        ? "border-amber-400 bg-amber-400/10 text-amber-200"
                        : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500"
                    }`}
                  >
                    {group.dayLabel}
                  </button>
                );
              })}
            </div>

            <div className="max-h-64 overflow-y-auto pr-1 snap-y snap-mandatory">
              <div className="grid grid-cols-1 gap-2">
                {activeGroup.items.map((slot) => {
                  const isSelected = selectedSlot?.startISO === slot.startISO;
                  return (
                    <button
                      key={slot.startISO}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot);
                        setErrors((prev) => ({ ...prev, slot: undefined }));
                        setSuccessMessage(null);
                      }}
                      className={`h-11 w-full snap-start rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/10 text-amber-200"
                          : "border-neutral-700 bg-neutral-950 text-neutral-200 hover:border-neutral-500"
                      }`}
                    >
                      {slot.timeLabel ?? slot.display}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {errors.slot && <p className="mt-3 text-xs text-red-400">{errors.slot}</p>}
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Your details</h2>
        {successMessage && (
          <div className="mt-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {successMessage}
          </div>
        )}
        {submitError && (
          <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {submitError}
          </div>
        )}

        <form className="mt-4 grid gap-4" onSubmit={onSubmit} noValidate>
          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">Full name</span>
            <input
              type="text"
              value={values.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            />
            {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">Business name</span>
            <input
              type="text"
              value={values.businessName}
              onChange={(event) => setField("businessName", event.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            />
            {errors.businessName && <p className="text-xs text-red-400">{errors.businessName}</p>}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">Email</span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">Phone</span>
            <input
              type="tel"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            />
            {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">What you&apos;re interested in</span>
            <select
              value={values.interest}
              onChange={(event) => setField("interest", event.target.value as InterestOption)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            >
              <option value="">Select one</option>
              <option value="AI Receptionist">AI Receptionist</option>
              <option value="AI Social Media Manager">AI Social Media Manager</option>
              <option value="Combined Package">Combined Package</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
            {errors.interest && <p className="text-xs text-red-400">{errors.interest}</p>}
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-neutral-200">Notes (optional)</span>
            <textarea
              rows={4}
              value={values.notes}
              onChange={(event) => setField("notes", event.target.value)}
              disabled={isSubmitting || Boolean(successMessage)}
              className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:opacity-70"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || Boolean(successMessage)}
            className="w-fit rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-70"
          >
            {isSubmitting ? "Booking..." : successMessage ? "Booked" : "Confirm booking"}
          </button>
        </form>
      </section>
    </div>
  );
}
