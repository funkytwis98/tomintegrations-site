type BookingInviteInput = {
  bookingId: number;
  slotStartISO: string;
  slotEndISO: string;
  businessName: string;
  interest: string;
};

function toIcsUtcTimestamp(date: Date): string {
  const iso = date.toISOString();
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n");
}

export function buildBookingInviteIcs(input: BookingInviteInput): string {
  const now = new Date();
  const start = new Date(input.slotStartISO);
  const end = new Date(input.slotEndISO);

  const uid = `${input.bookingId}@tomagency.local`;
  const description = escapeIcsText(
    [
      "Tom Agency demo booking",
      `Business: ${input.businessName}`,
      `Interest: ${input.interest}`,
      "Need to reschedule? Reply to your confirmation email.",
    ].join("\n")
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//Tom Agency//Booking//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtcTimestamp(now)}`,
    `DTSTART:${toIcsUtcTimestamp(start)}`,
    `DTEND:${toIcsUtcTimestamp(end)}`,
    "SUMMARY:Tom Agency Demo",
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
