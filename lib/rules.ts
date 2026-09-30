import type { Product } from "./types";

type R = Pick<Product, "lead_days" | "prepay_only" | "refundable">;

/** Customer-facing wording for a product's booking rules. One place, so cards, product page and checkout agree. */
export function rules(p: Partial<R>) {
  const refundable = p.refundable !== false;
  const prepay = p.prepay_only === true;
  const lead = Math.max(1, Number(p.lead_days) || 1);
  return {
    refundable,
    prepay,
    lead,
    cancelShort: refundable ? "Free cancellation" : "Non-refundable",
    cancelFact: refundable ? "Free cancellation 24 h" : "Non-refundable",
    cancelH: refundable ? "Free cancellation" : "Non-refundable",
    cancelP: refundable ? "Cancel up to 24 hours in advance for a full refund." : "Planned and shopped for you, so no refund once booked.",
    cancelPolicy: refundable ? "Free cancellation up to 24 hours before. Prepaid bookings are refunded in full." : "Non-refundable once booked.",
    payShort: prepay ? "Pay online to book" : "Pay on arrival",
    payFact: prepay ? "Paid online when booked" : "Pay on arrival",
    payH: prepay ? "Paid online when you book" : "Reserve now, pay later",
    payP: prepay ? "PayPal or card via PayPal. Secures your date." : "Book your spot and pay nothing today.",
    leadNote: lead > 1 ? `Book at least ${lead} days ahead` : null,
  };
}
