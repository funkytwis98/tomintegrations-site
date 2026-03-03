import { sql } from "@vercel/postgres";

export type BookingRow = {
  id: number;
  created_at: string;
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  interest: string;
  notes: string | null;
  slot_start: string;
  slot_end: string;
  timezone: string;
  status: string;
};

export async function ensureBookingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      interest TEXT NOT NULL,
      notes TEXT,
      slot_start TIMESTAMPTZ NOT NULL,
      slot_end TIMESTAMPTZ NOT NULL,
      timezone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed'
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
    ON bookings (slot_start, slot_end)
  `;
}

export async function listOverlappingBookings(startISO: string, endISO: string) {
  const result = await sql<Pick<BookingRow, "slot_start" | "slot_end">>`
    SELECT slot_start, slot_end
    FROM bookings
    WHERE status IN ('confirmed', 'pending')
      AND slot_start < ${endISO}::timestamptz
      AND slot_end > ${startISO}::timestamptz
  `;
  return result.rows;
}

export async function createBooking(input: {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  interest: string;
  notes: string;
  slotStartISO: string;
  slotEndISO: string;
  timezone: string;
}) {
  const result = await sql<Pick<BookingRow, "id">>`
    INSERT INTO bookings (
      full_name,
      business_name,
      email,
      phone,
      interest,
      notes,
      slot_start,
      slot_end,
      timezone,
      status
    )
    VALUES (
      ${input.fullName},
      ${input.businessName},
      ${input.email},
      ${input.phone},
      ${input.interest},
      ${input.notes || null},
      ${input.slotStartISO}::timestamptz,
      ${input.slotEndISO}::timestamptz,
      ${input.timezone},
      'confirmed'
    )
    RETURNING id
  `;

  return result.rows[0]?.id ?? null;
}

export async function listRecentBookings(limit = 100) {
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  const result = await sql<BookingRow>`
    SELECT
      id,
      created_at,
      full_name,
      business_name,
      email,
      phone,
      interest,
      notes,
      slot_start,
      slot_end,
      timezone,
      status
    FROM bookings
    ORDER BY slot_start DESC
    LIMIT ${safeLimit}
  `;
  return result.rows;
}
