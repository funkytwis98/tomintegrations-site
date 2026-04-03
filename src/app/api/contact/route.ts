import { createClient } from "@supabase/supabase-js";

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

    const supabaseUrl = process.env.COMMAND_CENTER_SUPABASE_URL;
    const supabaseKey = process.env.COMMAND_CENTER_SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { ok: false, error: "Server is missing required configuration." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const fullName = String(payload.fullName).trim();
    const businessName = String(payload.businessName).trim();
    const email = String(payload.email).trim();
    const phone = String(payload.phone).trim();
    const interest = String(payload.interest).trim();
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    const { error } = await supabase.from("inbox_items").insert({
      name: fullName,
      business: businessName,
      email,
      phone,
      interest,
      message: message || null,
      type: "demo_request",
      source: "website",
      status: "new",
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase insert error:", JSON.stringify(error, null, 2));
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
