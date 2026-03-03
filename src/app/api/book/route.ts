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

type InternalBookingEmailInput = {
  bookingId: number;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  interest: string;
  notes: string;
  slotDisplay: string;
  timezone: string;
  slotStartISO: string;
  slotEndISO: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildInternalBookingEmail(input: InternalBookingEmailInput) {
  const safeBookingId = escapeHtml(String(input.bookingId));
  const safeFullName = escapeHtml(input.fullName);
  const safeBusinessName = escapeHtml(input.businessName);
  const safeEmail = escapeHtml(input.email);
  const safePhone = escapeHtml(input.phone);
  const safeInterest = escapeHtml(input.interest);
  const safeNotes = escapeHtml(input.notes || "(none)");
  const safeSlotDisplay = escapeHtml(input.slotDisplay);
  const safeTimezone = escapeHtml(input.timezone);
  const safeSlotStartISO = escapeHtml(input.slotStartISO);
  const safeSlotEndISO = escapeHtml(input.slotEndISO);

  const text = [
    "New booking received",
    "",
    `Booking ID: ${input.bookingId}`,
    `Name: ${input.fullName}`,
    `Business: ${input.businessName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Interest: ${input.interest}`,
    `Notes: ${input.notes || "(none)"}`,
    `When: ${input.slotDisplay} (${input.timezone})`,
    `Slot start: ${input.slotStartISO}`,
    `Slot end: ${input.slotEndISO}`,
  ].join("\n");

  const html = `
    <div style="background:#f5f5f5;padding:20px;font-family:Arial,Helvetica,sans-serif;color:#111111;line-height:1.4;">
      <h1 style="margin:0 0 12px 0;font-size:22px;">New booking received</h1>
      <div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;padding:16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;width:140px;font-weight:700;vertical-align:top;">Booking ID</td>
            <td style="padding:6px 0;">${safeBookingId}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Name</td>
            <td style="padding:6px 0;">${safeFullName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Business</td>
            <td style="padding:6px 0;">${safeBusinessName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#111111;text-decoration:underline;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Phone</td>
            <td style="padding:6px 0;"><a href="tel:${safePhone}" style="color:#111111;text-decoration:underline;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Interest</td>
            <td style="padding:6px 0;">${safeInterest}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Notes</td>
            <td style="padding:6px 0;">${safeNotes}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">When</td>
            <td style="padding:6px 0;">${safeSlotDisplay} (${safeTimezone})</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Slot start</td>
            <td style="padding:6px 0;font-family:Menlo,Consolas,monospace;">${safeSlotStartISO}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Slot end</td>
            <td style="padding:6px 0;font-family:Menlo,Consolas,monospace;">${safeSlotEndISO}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  return { html, text };
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

    const internalEmail = buildInternalBookingEmail({
      bookingId,
      fullName,
      businessName,
      email,
      phone,
      interest,
      notes,
      slotDisplay,
      timezone,
      slotStartISO,
      slotEndISO,
    });

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
        html: internalEmail.html,
        text: internalEmail.text,
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
