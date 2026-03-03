import { google } from "googleapis";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const DEFAULT_WORK_HOURS =
  '{"mon":[["09:00","17:00"]],"tue":[["09:00","17:00"]],"wed":[["09:00","17:00"]],"thu":[["09:00","17:00"]],"fri":[["09:00","17:00"]],"sat":[],"sun":[]}';

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BookingConfig = {
  calendarId: string;
  timezone: string;
  slotMinutes: number;
  workHours: Record<WeekdayKey, Array<[string, string]>>;
};

type FreeBusyRange = {
  start: string;
  end: string;
};

type CreateEventInput = {
  start: string;
  end: string;
  summary: string;
  description: string;
  attendeeEmail?: string;
};

const weekdayOrder: WeekdayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export class BookingConfigError extends Error {
  missing: string[];

  constructor(message: string, missing: string[] = []) {
    super(message);
    this.name = "BookingConfigError";
    this.missing = missing;
  }
}

type BookingEnv = {
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  calendarId: string;
  timezone: string;
  slotMinutes: number;
  workHours: Record<WeekdayKey, Array<[string, string]>>;
};

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
  const env = getValidatedBookingEnv();
  return {
    calendarId: env.calendarId,
    timezone: env.timezone,
    slotMinutes: env.slotMinutes,
    workHours: env.workHours,
  };
}

export function getCalendarClient() {
  const env = getValidatedBookingEnv();

  const auth = new google.auth.JWT({
    email: env.serviceAccountEmail,
    key: env.serviceAccountPrivateKey,
    scopes: [CALENDAR_SCOPE],
  });

  return google.calendar({ version: "v3", auth });
}

export function getValidatedBookingEnv(): BookingEnv {
  const requiredKeys = [
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GOOGLE_CALENDAR_ID",
  ] as const;

  const missing = requiredKeys.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length > 0) {
    throw new BookingConfigError(
      `Missing required booking environment variable(s): ${missing.join(", ")}`,
      [...missing]
    );
  }

  const timezone = process.env.BOOKING_TIMEZONE ?? "America/Chicago";
  const slotMinutes = Number(process.env.BOOKING_SLOT_MINUTES ?? "30");
  if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) {
    throw new BookingConfigError("BOOKING_SLOT_MINUTES must be a positive number.");
  }

  const serviceAccountEmail = String(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL).trim();
  const serviceAccountPrivateKey = String(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY).replace(/\\n/g, "\n");
  const calendarId = String(process.env.GOOGLE_CALENDAR_ID).trim();
  if (!serviceAccountPrivateKey.includes("BEGIN PRIVATE KEY")) {
    throw new BookingConfigError(
      "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY looks invalid. Paste the private_key from the service account JSON and keep \\n escapes."
    );
  }

  let workHours: Record<WeekdayKey, Array<[string, string]>>;
  try {
    workHours = parseWorkHours(process.env.BOOKING_WORK_HOURS_JSON ?? DEFAULT_WORK_HOURS);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "BOOKING_WORK_HOURS_JSON must be a valid JSON object.";
    throw new BookingConfigError(message);
  }

  return {
    serviceAccountEmail,
    serviceAccountPrivateKey,
    calendarId,
    timezone,
    slotMinutes,
    workHours,
  };
}

export async function listBusyTimes(timeMin: string, timeMax: string): Promise<FreeBusyRange[]> {
  const { calendarId } = getBookingConfig();
  const calendar = getCalendarClient();

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const busy = response.data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((item): item is { start: string; end: string } => Boolean(item.start && item.end))
    .map((item) => ({ start: item.start, end: item.end }));
}

export async function createEvent({
  start,
  end,
  summary,
  description,
  attendeeEmail,
}: CreateEventInput) {
  const { calendarId, timezone } = getBookingConfig();
  const calendar = getCalendarClient();

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: start, timeZone: timezone },
      end: { dateTime: end, timeZone: timezone },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : undefined,
    },
  });

  return response.data;
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
