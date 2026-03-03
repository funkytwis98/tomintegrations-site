# Google Calendar Booking Setup (Service Account)

This app uses a Google service account and a dedicated Google Calendar.
No OAuth user login flow is required.

## 1) Create Google Cloud project

1. Open Google Cloud Console: `https://console.cloud.google.com/`
2. Click the project selector (top bar) -> `New Project`.
3. Name it (example: `tom-agency-booking`) and create it.
4. Make sure this new project is selected.

## 2) Enable Google Calendar API

1. In Google Cloud Console, go to:
   `APIs & Services -> Library`
2. Search for `Google Calendar API`.
3. Click it and press `Enable`.

## 3) Create a service account + key

1. Go to:
   `IAM & Admin -> Service Accounts`
2. Click `Create Service Account`.
3. Name it (example: `booking-calendar-bot`) and create.
4. Open the new service account -> `Keys` tab.
5. Click `Add Key -> Create new key -> JSON`.
6. Download the JSON key file.

Security:
- Keep this JSON file private.
- Never commit it to git.
- Do not paste it in chat or screenshots.

## 4) Create dedicated Google Calendar

1. Open Google Calendar: `https://calendar.google.com/`
2. Under `Other calendars`, click `+` -> `Create new calendar`.
3. Name it exactly: `Tom Agency Bookings`.
4. Save.

## 5) Share calendar with the service account

1. In Google Calendar, open `Tom Agency Bookings` settings.
2. Go to `Share with specific people or groups`.
3. Add the service account email from the JSON (`client_email`).
4. Permission must be: `Make changes to events`.

If this step is missed, booking health will fail with access/permission errors.

## 6) Find Calendar ID

1. In the same calendar settings, open:
   `Integrate calendar`
2. Copy `Calendar ID`.
3. This value is `GOOGLE_CALENDAR_ID`.

## 7) Map JSON fields to env vars

From the downloaded service account JSON:

- `client_email` -> `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` -> `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

From Google Calendar settings:

- `Calendar ID` -> `GOOGLE_CALENDAR_ID`

From app config:

- `BOOKING_TIMEZONE` (default `America/Chicago`)
- `BOOKING_SLOT_MINUTES` (default `30`)
- `BOOKING_WORK_HOURS_JSON` (default shown below)

Resend (existing):

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL`
- `CONTACT_TO_EMAIL`

## 8) Local `.env.local` template

Use this as a starting point:

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=
BOOKING_TIMEZONE=America/Chicago
BOOKING_SLOT_MINUTES=30
BOOKING_WORK_HOURS_JSON={"mon":[["09:00","17:00"]],"tue":[["09:00","17:00"]],"wed":[["09:00","17:00"]],"thu":[["09:00","17:00"]],"fri":[["09:00","17:00"]],"sat":[],"sun":[]}

RESEND_API_KEY=
CONTACT_FROM_EMAIL="Tom Agency <onboarding@resend.dev>"
CONTACT_TO_EMAIL=
```

Private key formatting rule:
- In `.env.local` and Vercel env vars, private key should be one line with escaped newlines (`\n`), not literal line breaks.
- Example shape only:
  `-----BEGIN PRIVATE KEY-----\nABC...\nXYZ...\n-----END PRIVATE KEY-----\n`

## 9) Vercel env var notes

In Vercel project settings -> Environment Variables:

- Add all booking + Resend vars for `Production` (and `Preview` if needed).
- For `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, paste single-line escaped value with `\n`.
- Redeploy after saving env vars.

## 10) Health + functional checks

Run local checks:

```bash
curl -s http://localhost:3000/api/booking-health
curl -s http://localhost:3000/api/availability
curl -s -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  --data '{"email":"bad@example.com"}'
```

Expected:
- `/api/booking-health` -> `ok:true` once env + sharing are correct.
- `/api/availability` -> `ok:true` with slots.
- bad `/api/book` payload -> `400` with field errors.

Then test real booking with a valid slot from `/api/availability`.
