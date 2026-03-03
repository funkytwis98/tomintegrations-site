import { BookingConfigError, getBookingConfig, getCalendarClient, getValidatedBookingEnv } from "@/src/lib/googleCalendar";

export const runtime = "nodejs";

export async function GET() {
  try {
    const env = getValidatedBookingEnv();
    const { timezone, slotMinutes, calendarId } = getBookingConfig();
    const calendar = getCalendarClient();

    const windowStart = new Date();
    const windowEnd = new Date(windowStart.getTime() + 15 * 60_000);

    await calendar.freebusy.query({
      requestBody: {
        timeMin: windowStart.toISOString(),
        timeMax: windowEnd.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    return Response.json({
      ok: true,
      googleAuth: true,
      calendarAccess: true,
      timezone,
      slotMinutes,
      serviceAccountEmail: env.serviceAccountEmail,
      calendarId,
    });
  } catch (error: unknown) {
    if (error instanceof BookingConfigError) {
      return Response.json(
        {
          ok: false,
          error: error.message,
          missing: error.missing,
        },
        { status: 500 }
      );
    }

    const maybeStatus = (error as { status?: number; code?: number }).status ?? (error as { code?: number }).code;
    const rawMessage = error instanceof Error ? error.message : "Unexpected server error.";
    const lower = rawMessage.toLowerCase();

    if (maybeStatus === 403 || maybeStatus === 404 || lower.includes("not found") || lower.includes("forbidden")) {
      return Response.json(
        {
          ok: false,
          error:
            "Google Calendar access failed. Confirm GOOGLE_CALENDAR_ID is correct and the calendar is shared with the service account email with 'Make changes to events'.",
          missing: [],
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        ok: false,
        error: rawMessage,
        missing: [],
      },
      { status: 500 }
    );
  }
}
