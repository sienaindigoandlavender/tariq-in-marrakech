import { copy } from "./copy";
import { fmtDate } from "./dates";

type S = {
  ref: string;
  title: string;
  mode: string;
  date: string;
  guests: number;
  extras: string[];
  pickup: string;
  lead_name: string;
  phone?: string;
  notes?: string | null;
  totalText: string;
};

/** WhatsApp text for one booking. */
export function bookingSummary(b: S): string {
  const d = copy.done;
  return [
    `${d.ref}: ${b.ref}`,
    `${d.booking}: ${b.title}${b.mode === "private" ? ` (${copy.checkout.private})` : ""}`,
    `${d.when}: ${fmtDate(b.date)}`,
    `${d.who}: ${b.guests}`,
    b.extras.length ? `${d.with}: ${b.extras.join(", ")}` : null,
    `${d.where}: ${b.pickup}`,
    `${copy.checkout.name}: ${b.lead_name}`,
    b.phone ? `${copy.checkout.phone}: ${b.phone}` : null,
    `${d.pay}: ${b.totalText}`,
    b.notes ? b.notes : null,
  ]
    .filter(Boolean)
    .join("\n");
}
