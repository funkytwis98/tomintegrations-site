"use client";

import Link from "next/link";
import { useState } from "react";

type InterestOption =
  | ""
  | "AI Receptionist"
  | "AI Social Media Manager"
  | "Combined Package"
  | "Not sure yet";

type FormValues = {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  interest: InterestOption;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
};

export default function ContactPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = (input: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!input.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!input.businessName.trim()) {
      nextErrors.businessName = "Business name is required.";
    }

    const email = input.email.trim();
    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const phoneDigits = input.phone.replace(/\D/g, "");
    if (!input.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    } else if (phoneDigits.length < 10) {
      nextErrors.phone = "Enter a valid phone number with at least 10 digits.";
    }

    if (!input.interest) {
      nextErrors.interest = "Please select what you're interested in.";
    }

    return nextErrors;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName,
          businessName: values.businessName,
          email: values.email,
          phone: values.phone,
          interest: values.interest,
          message: values.message,
        }),
      });

      if (response.status === 400) {
        const data = (await response.json()) as {
          ok: false;
          errors?: FormErrors;
        };
        setErrors(data.errors ?? {});
        return;
      }

      if (!response.ok) {
        setGeneralError("Something went wrong on our side. Please try again.");
        return;
      }

      setValues(initialValues);
      setErrors({});
      setGeneralError(null);
      setSubmitted(true);
    } catch {
      setGeneralError("Unable to submit right now. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-neutral-400">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Contact</h1>
        <p className="mt-3 max-w-3xl text-neutral-300">
          Tell us what you need. We’ll reply within 1 business day.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 md:p-8">
          <h2 className="text-xl font-semibold">Before you submit</h2>
          <p className="mt-3 text-sm text-neutral-300">
            Share enough detail so we can recommend the right plan and next step on the first reply.
          </p>

          <ul className="mt-5 space-y-2 text-sm text-neutral-300">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-400">●</span>
              <span>Your business type and location count</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-400">●</span>
              <span>Where leads come from today (calls, social, referrals)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-400">●</span>
              <span>Your biggest bottleneck right now</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-400">●</span>
              <span>How quickly you want to launch</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 md:p-8">
          {generalError && (
            <div className="mb-5 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {generalError}
            </div>
          )}

          {submitted && (
            <div className="mb-5 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Thanks. We got it. We’ll reach out shortly.
            </div>
          )}

          <form className="grid gap-4" onSubmit={onSubmit} noValidate>
            <label className="grid gap-2 text-sm">
              <span className="text-neutral-200">Full name</span>
              <input
                type="text"
                name="fullName"
                value={values.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
              {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-neutral-200">Business name</span>
              <input
                type="text"
                name="businessName"
                value={values.businessName}
                onChange={(event) => setField("businessName", event.target.value)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
              {errors.businessName && <p className="text-xs text-red-400">{errors.businessName}</p>}
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-neutral-200">Email</span>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={(event) => setField("email", event.target.value)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-neutral-200">Phone</span>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={(event) => setField("phone", event.target.value)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-neutral-200">What you’re interested in</span>
              <select
                name="interest"
                value={values.interest}
                onChange={(event) => setField("interest", event.target.value as InterestOption)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
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
              <span className="text-neutral-200">Message (optional)</span>
              <textarea
                name="message"
                rows={5}
                value={values.message}
                onChange={(event) => setField("message", event.target.value)}
                disabled={submitted || isSubmitting}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none ring-amber-300/30 transition focus:ring disabled:cursor-not-allowed disabled:opacity-70"
              />
            </label>

            <button
              type="submit"
              disabled={submitted || isSubmitting}
              className="w-fit rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitted ? "Submitted" : isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>

          <p className="mt-4 text-sm text-neutral-400">
            Prefer to book a call?{" "}
            <Link href="/book" className="font-semibold text-amber-300 hover:text-amber-200">
              Book a demo.
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
