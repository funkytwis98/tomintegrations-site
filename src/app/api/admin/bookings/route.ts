import { ensureBookingsTable, listRecentBookings } from "@/src/lib/bookingsDb";

export const runtime = "nodejs";

function readPassword(request: Request): string {
  const url = new URL(request.url);
  const queryPassword = url.searchParams.get("password");
  const headerPassword = request.headers.get("x-admin-password");
  return (queryPassword ?? headerPassword ?? "").trim();
}

export async function GET(request: Request) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  const supplied = readPassword(request);

  if (!expected) {
    return Response.json({ ok: false, error: "ADMIN_PASSWORD is not configured." }, { status: 500 });
  }

  if (!supplied || supplied !== expected) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await ensureBookingsTable();
    const bookings = await listRecentBookings(200);
    return Response.json({ ok: true, bookings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
