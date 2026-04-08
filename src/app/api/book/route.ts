import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type InterestOption = "AI Receptionist" | "AI Social Media Manager" | "Combined Package" | "Not sure yet";

type BookingPayload = {
  fullName?: unknown;
  businessName?: unknown;
  email?: unknown;
  phone?: unknown;
  interest?: unknown;
  notes?: unknown;
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

  return errors;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingPayload;
    const errors = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      return Response.json({ ok: false, errors }, { status: 400 });
    }

    const supabaseUrl = process.env.COMMAND_CENTER_SUPABASE_URL;
    const supabaseKey = process.env.COMMAND_CENTER_SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { ok: false, error: "Server configuration error." },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase.from("inbox_items").insert({
      name: String(payload.fullName).trim(),
      business: String(payload.businessName).trim(),
      email: String(payload.email).trim(),
      phone: String(payload.phone).trim(),
      interest: String(payload.interest).trim(),
      message: typeof payload.notes === "string" ? payload.notes.trim() : "",
      type: "demo_request",
      source: "website",
      status: "new",
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("[book] supabase insert failed:", insertError.message);
      return Response.json(
        { ok: false, error: "Could not submit your request. Please try again." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    console.error("[book] unexpected error:", message);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
