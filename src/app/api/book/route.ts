import { Resend } from "resend";

import { BookingConfigError, getBookingConfig, getMissingBookingEnvVarsForHealth } from "@/src/lib/bookingConfig";
import { createBooking, ensureBookingsTable, listOverlappingBookings } from "@/src/lib/bookingsDb";

export const runtime = "nodejs";

type InterestOption = "AI Receptionist" | "AI Social Media Manager" | "Combined Package" | "Not sure yet";

type BookingPayload = {
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  phone?: unknown;
  interest?: unknown;
  notes?: unknown;
  slotStartISO?: unknown;
  slotEndISO?: unknown;
};

type ValidationErrors = {
  fullName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  interest?: string;
  slotStartISO?: string;
  slotEndISO?: string;
};

const validInterestOptions: InterestOption[] = [
  "AI Receptionist",
  "AI Social Media Manager",
  "Combined Package",
  "Not sure yet",
];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function resendMessageId(result: unknown): string | null {
  if (!result || typeof result !== "object") {
    return null;
  }
  const candidate = (result as { data?: { id?: unknown } }).data?.id;
  return typeof candidate === "string" ? candidate : null;
}

function validatePayload(input: BookingPayload): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isNonEmptyString(input.fullName)) {
    errors.fullName = "Full name is required.";
  }

  if (!isNonEmptyString(input.businessName)) {
    errors.businessName = "Business name is required.";
  }

  if (!isNonEmptyString(input.email)) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!isNonEmptyString(input.phone)) {
    errors.phone = "Phone is required.";
  } else if (input.phone.replace(/\D/g, "").length < 10) {
    errors.phone = "Enter a valid phone number with at least 10 digits.";
  }

  if (!isNonEmptyString(input.interest)) {
    errors.interest = "Please select what you're interested in.";
  } else if (!validInterestOptions.includes(input.interest as InterestOption)) {
    errors.interest = "Please select a valid option.";
  }

  if (!isNonEmptyString(input.slotStartISO) || Number.isNaN(new Date(input.slotStartISO).getTime())) {
    errors.slotStartISO = "A valid slot start time is required.";
  }

  if (!isNonEmptyString(input.slotEndISO) || Number.isNaN(new Date(input.slotEndISO).getTime())) {
    errors.slotEndISO = "A valid slot end time is required.";
  }

  if (!errors.slotStartISO && !errors.slotEndISO) {
    const start = new Date(String(input.slotStartISO));
    const end = new Date(String(input.slotEndISO));
    if (end <= start) {
      errors.slotEndISO = "Slot end must be after slot start.";
    }
  }

  return errors;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const errors = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;
    const notifyEmail = process.env.CONTACT_TO_EMAIL;
    if (!apiKey || !fromEmail || !notifyEmail) {
      return Response.json(
        { ok: false, error: "Server is missing required email configuration." },
        { status: 500 }
      );
    }

    const missing = getMissingBookingEnvVarsForHealth();
    if (missing.length > 0) {
      return Response.json(
        {
          ok: false,
          error: `Missing required booking environment variable(s): ${missing.join(", ")}`,
          missing,
        },
        { status: 500 }
      );
    }

    await ensureBookingsTable();

    const { timezone } = getBookingConfig();
    const fullName = String(payload.fullName).trim();
    const businessName = String(payload.businessName).trim();
    const email = String(payload.email).trim();
    const phone = String(payload.phone).trim();
    const interest = String(payload.interest).trim();
    const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";
    const slotStartISO = new Date(String(payload.slotStartISO)).toISOString();
    const slotEndISO = new Date(String(payload.slotEndISO)).toISOString();

    const overlapping = await listOverlappingBookings(slotStartISO, slotEndISO);
    if (overlapping.length > 0) {
      return Response.json({ ok: false, error: "Slot no longer available." }, { status: 409 });
    }

    let bookingId: number | null = null;
    try {
      bookingId = await createBooking({
        fullName,
        businessName,
        email,
        phone,
        interest,
        notes,
        slotStartISO,
        slotEndISO,
        timezone,
      });
    } catch (error) {
      const pgCode = (error as { code?: string })?.code;
      if (pgCode === "23505") {
        return Response.json({ ok: false, error: "Slot no longer available." }, { status: 409 });
      }
      throw error;
    }

    if (!bookingId) {
      return Response.json({ ok: false, error: "Could not create booking." }, { status: 500 });
    }

    const slotDisplay = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(slotStartISO));

    const resend = new Resend(apiKey);
    const customerSubject = "Tom Agency booking confirmed";
    const customerText = [
      `Hi ${fullName},`,
      "",
      "Your demo is booked.",
      `When: ${slotDisplay} (${timezone})`,
      "",
      "What to expect:",
      "- We will review your current lead flow",
      "- We will show receptionist + social workflow",
      "- We will outline next steps for your business",
      "",
      "Reply to this email if you need to reschedule.",
    ].join("\n");

    const internalText = [
      "New booking received",
      "",
      `Booking ID: ${bookingId}`,
      `Name: ${fullName}`,
      `Business: ${businessName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Interest: ${interest}`,
      `Notes: ${notes || "(none)"}`,
      `When: ${slotDisplay} (${timezone})`,
      `Slot start: ${slotStartISO}`,
      `Slot end: ${slotEndISO}`,
    ].join("\n");

    const [customerResult, internalResult] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: email,
        replyTo: notifyEmail,
        subject: customerSubject,
        text: customerText,
      }),
      resend.emails.send({
        from: fromEmail,
        to: notifyEmail,
        replyTo: email,
        subject: `New booking: ${businessName}`,
        text: internalText,
      }),
    ]);

    const emailError = customerResult.error ?? internalResult.error;
    if (emailError) {
      return Response.json({ ok: false, error: emailError.message }, { status: 500 });
    }

    const emailCustomerId = resendMessageId(customerResult);
    const emailInternalId = resendMessageId(internalResult);
    console.log("[booking] resend customer id:", emailCustomerId);
    console.log("[booking] resend internal id:", emailInternalId);

    return Response.json({
      ok: true,
      bookingId,
      slotStartISO,
      slotEndISO,
      emailCustomerId,
      emailInternalId,
    });
  } catch (error) {
    if (error instanceof BookingConfigError) {
      return Response.json({ ok: false, error: error.message, missing: error.missing }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
