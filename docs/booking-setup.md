# Booking Setup (Custom Scheduler + Vercel Postgres)

This project now uses:
- custom slot generation (no calendar provider)
- Vercel Postgres for bookings
- Resend for customer/internal booking emails

## 1) Connect Vercel Postgres

1. In Vercel project dashboard, open `Storage`.
2. Create or attach a Postgres database.
3. In project env vars, confirm `POSTGRES_URL` is present.

## 2) Set required environment variables

Use `.env.example` as your source of truth.

Required:

- `POSTGRES_URL`
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`
- `ADMIN_PASSWORD`
- `BOOKING_TIMEZONE` (example: `America/Chicago`)
- `BOOKING_SLOT_MINUTES` (example: `30`)
- `BOOKING_WORK_HOURS_JSON`

Example hours:

```dotenv
BOOKING_WORK_HOURS_JSON={"mon":[["09:00","17:00"]],"tue":[["09:00","17:00"]],"wed":[["09:00","17:00"]],"thu":[["09:00","17:00"]],"fri":[["09:00","17:00"]],"sat":[],"sun":[]}
```

## 3) Database schema

The API auto-creates `bookings` table + unique slot index on first request.
If you want a manual migration, run the SQL in `scripts/sql/bookings.sql`.

## 4) Health check

```bash
curl -s http://localhost:3000/api/booking-health
```

Expected when configured:

```json
{"ok":true,"db":true,"timezone":"America/Chicago","slotMinutes":30}
```

## 5) Availability + booking checks

```bash
curl -s http://localhost:3000/api/availability
```

Then book a slot:

```bash
curl -s -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  --data '{"fullName":"Test","businessName":"Test Biz","email":"you@example.com","phone":"555-555-5555","interest":"AI Receptionist","notes":"test","slotStartISO":"<from availability>","slotEndISO":"<from availability>"}'
```

Successful response includes:
- `bookingId`
- `slotStartISO`
- `slotEndISO`
- `emailCustomerId`
- `emailInternalId`

## 6) Admin endpoint

List latest bookings:

```bash
curl -s "http://localhost:3000/api/admin/bookings?password=<ADMIN_PASSWORD>"
```

or use header:

```bash
curl -s http://localhost:3000/api/admin/bookings -H "x-admin-password: <ADMIN_PASSWORD>"
```
