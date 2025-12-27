export const OUTREACH_TIME_ZONE = "America/Los_Angeles" as const;

export function formatDateTimeLA(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: OUTREACH_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(date);
}

export function parseISODateTime(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export function toISOFromPickerDate(date: Date): string {
  return date.toISOString();
}
