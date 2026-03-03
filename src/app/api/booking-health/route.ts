import { sql } from "@vercel/postgres";

import { BookingConfigError, getBookingConfig, getMissingBookingEnvVarsForHealth } from "@/src/lib/bookingConfig";
import { ensureBookingsTable } from "@/src/lib/bookingsDb";

export const runtime = "nodejs";

export async function GET() {
  try {
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

    const { timezone, slotMinutes } = getBookingConfig();
    await ensureBookingsTable();
    await sql`SELECT 1`;

    return Response.json({
      ok: true,
      db: true,
      timezone,
      slotMinutes,
    });
  } catch (error) {
    if (error instanceof BookingConfigError) {
      return Response.json({ ok: false, error: error.message, missing: error.missing }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message, missing: [] }, { status: 500 });
  }
}
