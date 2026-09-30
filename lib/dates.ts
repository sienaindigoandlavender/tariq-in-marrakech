export const TZ = "Africa/Casablanca";

/** Today's date (YYYY-MM-DD) in Marrakech. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function tomorrow(): string {
  return addDays(today(), 1);
}

export function isYmd(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T12:00:00Z"));
}

/** "Saturday 4 October" */
export function fmtDate(ymd: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): string {
  return new Date(ymd + "T12:00:00Z").toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

/** First bookable date for a product: tomorrow, or later when it needs more notice. */
export function earliest(p: { lead_days?: number | null }): string {
  return addDays(today(), Math.max(1, Number(p.lead_days) || 1));
}

/** A preferred date if it's still bookable for this product, otherwise the first bookable one. */
export function bookable(p: { lead_days?: number | null }, d?: string | null): string {
  const min = earliest(p);
  return d && isYmd(d) && d >= min ? d : min;
}
