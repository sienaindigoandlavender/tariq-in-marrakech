import type { BookingStatus } from "./types";

export const STATUS_FLOW: BookingStatus[] = ["confirmed", "reminded", "picked", "paid"];
export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  reminded: "Reminded",
  picked: "Picked up",
  paid: "Paid",
  noshow: "No-show",
  cancelled: "Cancelled",
};

/** Next status when the chip is tapped. No-show goes back to confirmed. */
export function nextStatus(s: BookingStatus): BookingStatus {
  if (s === "noshow") return "confirmed";
  const i = STATUS_FLOW.indexOf(s);
  return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : s;
}

/** Minutes after midnight for the first HH:MM in a product's timing ("Pickup 8:30" -> 510). */
export function pickupMinutes(timing: string): number {
  const m = timing.match(/(\d{1,2})[:h](\d{2})?/);
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : 24 * 60;
}
