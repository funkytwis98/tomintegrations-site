import {
  addDaysToDateKey,
  BookingConfigError,
  dateKeyInTimezone,
  formatSlotDisplay,
  getBookingConfig,
  getMissingBookingEnvVarsForHealth,
  weekdayFromDateKey,
  zonedDateTimeToUtcISO,
} from "@/src/lib/bookingConfig";
import { ensureBookingsTable, listOverlappingBookings } from "@/src/lib/bookingsDb";

export const runtime = "nodejs";

type Slot = {
  startISO: string;
  endISO: string;
  display: string;
  dayLabel: string;
  timeLabel: string;
};

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

export async function GET(request: Request) {
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

    await ensureBookingsTable();

    const { timezone, slotMinutes, workHours } = getBookingConfig();
    const { searchParams } = new URL(request.url);

    const startParam = searchParams.get("start");
    const daysParam = Number(searchParams.get("days") ?? "14");
    const days = Number.isFinite(daysParam) ? Math.min(Math.max(Math.floor(daysParam), 1), 31) : 14;

    const baseDate = startParam ? new Date(startParam) : new Date();
    if (Number.isNaN(baseDate.getTime())) {
      return Response.json({ ok: false, error: "Invalid start date." }, { status: 400 });
    }

    const startDateKey = dateKeyInTimezone(baseDate, timezone);
    const rangeStart = zonedDateTimeToUtcISO(startDateKey, "00:00", timezone);
    const endDateKey = addDaysToDateKey(startDateKey, days);
    const rangeEnd = zonedDateTimeToUtcISO(endDateKey, "00:00", timezone);

    const busyTimes = await listOverlappingBookings(rangeStart, rangeEnd);
    const now = new Date();
    const slots: Slot[] = [];

    const dayFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    });

    for (let i = 0; i < days; i += 1) {
      const dateKey = addDaysToDateKey(startDateKey, i);
      const weekday = weekdayFromDateKey(dateKey);
      const dayRanges = workHours[weekday] ?? [];

      for (const [rangeStartTime, rangeEndTime] of dayRanges) {
        let currentStart = zonedDateTimeToUtcISO(dateKey, rangeStartTime, timezone);
        const rangeEndISO = zonedDateTimeToUtcISO(dateKey, rangeEndTime, timezone);

        while (new Date(currentStart) < new Date(rangeEndISO)) {
          const currentEnd = new Date(new Date(currentStart).getTime() + slotMinutes * 60_000).toISOString();
          if (new Date(currentEnd) > new Date(rangeEndISO)) {
            break;
          }

          const isPast = new Date(currentStart) <= now;
          const isBusy = busyTimes.some((busy) =>
            overlaps(currentStart, currentEnd, busy.slot_start.toString(), busy.slot_end.toString())
          );
          if (!isPast && !isBusy) {
            const startDate = new Date(currentStart);
            slots.push({
              startISO: currentStart,
              endISO: currentEnd,
              display: formatSlotDisplay(currentStart, timezone),
              dayLabel: dayFormatter.format(startDate),
              timeLabel: timeFormatter.format(startDate),
            });
          }

          currentStart = currentEnd;
        }
      }
    }

    return Response.json({
      ok: true,
      timezone,
      slotMinutes,
      slots,
    });
  } catch (error) {
    if (error instanceof BookingConfigError) {
      return Response.json({ ok: false, error: error.message, missing: error.missing }, { status: 500 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
