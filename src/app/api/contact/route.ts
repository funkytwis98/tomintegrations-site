import { Resend } from "resend";

export const runtime = "nodejs";

type InterestOption =
  | "AI Receptionist"
  | "AI Social Media Manager"
  | "Combined Package"
  | "Not sure yet";

type ContactPayload = {
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  phone?: unknown;
  interest?: unknown;
  message?: unknown;
};

type ValidationErrors = {
  fullName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  interest?: string;
};

const validInterestOptions: InterestOption[] = [
  "AI Receptionist",
  "AI Social Media Manager",
  "Combined Package",
  "Not sure yet",
];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function validatePayload(input: ContactPayload): ValidationErrors {
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
  } else {
    const digits = input.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      errors.phone = "Enter a valid phone number with at least 10 digits.";
    }
  }

  if (!isNonEmptyString(input.interest)) {
    errors.interest = "Please select what you're interested in.";
  } else if (!validInterestOptions.includes(input.interest as InterestOption)) {
    errors.interest = "Please select a valid option.";
  }

  return errors;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;
    const errors = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !toEmail || !fromEmail) {
      return Response.json(
        { ok: false, error: "Server is missing required email configuration." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const fullName = String(payload.fullName).trim();
    const businessName = String(payload.businessName).trim();
    const email = String(payload.email).trim();
    const phone = String(payload.phone).trim();
    const interest = String(payload.interest).trim();
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const submittedTime = new Date().toISOString();

    const subject = `New contact lead: ${businessName}`;

    const lines = [
      `Full name: ${fullName}`,
      `Business name: ${businessName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Interest: ${interest}`,
      `Message: ${message || "(none)"}`,
      `Submitted time: ${submittedTime}`,
    ];

    const safeFullName = escapeHtml(fullName);
    const safeBusinessName = escapeHtml(businessName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeInterest = escapeHtml(interest);
    const safeMessage = escapeHtml(message || "(none)");
    const safeSubmittedTime = escapeHtml(submittedTime);

    const html = `
      <div style="background:#ffffff;color:#111111;font-family:Arial,Helvetica,sans-serif;padding:20px;line-height:1.5;">
        <h1 style="margin:0 0 16px 0;font-size:22px;">New contact lead</h1>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Full name</td>
            <td style="padding:6px 0;">${safeFullName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Business name</td>
            <td style="padding:6px 0;">${safeBusinessName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Email</td>
            <td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#111111;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Phone</td>
            <td style="padding:6px 0;"><a href="tel:${safePhone}" style="color:#111111;">${safePhone}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Interest</td>
            <td style="padding:6px 0;">${safeInterest}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Message</td>
            <td style="padding:6px 0;">${safeMessage}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-weight:700;vertical-align:top;">Submitted time</td>
            <td style="padding:6px 0;">${safeSubmittedTime}</td>
          </tr>
        </table>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject,
      html,
      text: lines.join("\n"),
    });

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
