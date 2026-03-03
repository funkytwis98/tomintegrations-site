export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BookingConfig = {
  timezone: string;
  slotMinutes: number;
  workHours: Record<WeekdayKey, Array<[string, string]>>;
};

const DEFAULT_WORK_HOURS =
  '{"mon":[["09:00","17:00"]],"tue":[["09:00","17:00"]],"wed":[["09:00","17:00"]],"thu":[["09:00","17:00"]],"fri":[["09:00","17:00"]],"sat":[],"sun":[]}';

const weekdayOrder: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export class BookingConfigError extends Error {
  missing: string[];

  constructor(message: string, missing: string[] = []) {
    super(message);
    this.name = "BookingConfigError";
    this.missing = missing;
  }
}

function parseWorkHours(raw: string): Record<WeekdayKey, Array<[string, string]>> {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("BOOKING_WORK_HOURS_JSON must be a valid JSON object.");
  }

  const defaults: Record<WeekdayKey, Array<[string, string]>> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };

  for (const key of Object.keys(defaults) as WeekdayKey[]) {
    const value = (parsed as Record<string, unknown>)[key];
    if (!Array.isArray(value)) {
      continue;
    }
    defaults[key] = value
      .filter((pair): pair is [unknown, unknown] => Array.isArray(pair) && pair.length === 2)
      .map(([start, end]) => [String(start), String(end)]);
  }

  return defaults;
}

export function getBookingConfig(): BookingConfig {
  const missing: string[] = [];
  if (!process.env.BOOKING_TIMEZONE) {
    missing.push("BOOKING_TIMEZONE");
  }
  if (!process.env.BOOKING_SLOT_MINUTES) {
    missing.push("BOOKING_SLOT_MINUTES");
  }
  if (!process.env.BOOKING_WORK_HOURS_JSON) {
    missing.push("BOOKING_WORK_HOURS_JSON");
  }
  if (missing.length > 0) {
    throw new BookingConfigError(`Missing required booking environment variable(s): ${missing.join(", ")}`, missing);
  }

  const timezone = process.env.BOOKING_TIMEZONE ?? "America/Chicago";
  const slotMinutes = Number(process.env.BOOKING_SLOT_MINUTES ?? "30");
  if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) {
    throw new BookingConfigError("BOOKING_SLOT_MINUTES must be a positive number.");
  }

  try {
    const workHours = parseWorkHours(process.env.BOOKING_WORK_HOURS_JSON ?? DEFAULT_WORK_HOURS);
    return { timezone, slotMinutes, workHours };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "BOOKING_WORK_HOURS_JSON must be a valid JSON object.";
    throw new BookingConfigError(message);
  }
}

export function getMissingBookingEnvVarsForHealth() {
  const hasPostgres = Boolean(process.env.POSTGRES_URL?.trim() || process.env.DATABASE_URL?.trim());
  const required = [
    "RESEND_API_KEY",
    "CONTACT_FROM_EMAIL",
    "CONTACT_TO_EMAIL",
    "BOOKING_TIMEZONE",
    "BOOKING_SLOT_MINUTES",
    "BOOKING_WORK_HOURS_JSON",
  ] as const;
  const missing: string[] = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (!hasPostgres) {
    missing.unshift("POSTGRES_URL");
  }
  return missing;
}

function zonedParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "0";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function dateKeyInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return utc.toISOString().slice(0, 10);
}

export function weekdayFromDateKey(dateKey: string): WeekdayKey {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekdayOrder[weekday];
}

export function zonedDateTimeToUtcISO(dateKey: string, time: string, timezone: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  for (let i = 0; i < 3; i += 1) {
    const current = zonedParts(candidate, timezone);
    const desiredMs = Date.UTC(year, month - 1, day, hour, minute);
    const currentMs = Date.UTC(current.year, current.month - 1, current.day, current.hour, current.minute);
    const deltaMinutes = (desiredMs - currentMs) / 60000;
    if (deltaMinutes === 0) {
      break;
    }
    candidate = new Date(candidate.getTime() + deltaMinutes * 60000);
  }

  return candidate.toISOString();
}

export function formatSlotDisplay(startISO: string, timezone: string): string {
  const date = new Date(startISO);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
