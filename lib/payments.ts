import "server-only";
import { captureOrder } from "./paypal";
import { supabaseAdmin } from "./supabase/admin";

type Row = { ref: string; product_id: string; status: string; payment_status: string; paypal_order_id: string | null; total_eur: number };

export async function bookingByRef(ref: string): Promise<Row | null> {
  const { data } = await supabaseAdmin()!.from("bookings").select("ref, product_id, status, payment_status, paypal_order_id, total_eur").eq("ref", ref).maybeSingle();
  return (data as Row) ?? null;
}

/** Record a completed PayPal capture. Safe to call twice (return URL and webhook). */
export async function markPaid(ref: string, captureId: string, amountEur: number | null) {
  const b = await bookingByRef(ref);
  if (!b || b.payment_status === "paid") return b;
  if (amountEur !== null && Math.abs(amountEur - Number(b.total_eur)) > 0.009) {
    console.error(`[payments] ${ref}: captured €${amountEur} but booking total is €${b.total_eur}`);
  }
  await supabaseAdmin()!
    .from("bookings")
    .update({
      status: b.status === "pending_payment" || b.status === "cancelled" ? "confirmed" : b.status,
      payment_status: "paid",
      paypal_capture_id: captureId,
      paid_eur: amountEur ?? b.total_eur,
      paid_at: new Date().toISOString(),
    })
    .eq("ref", ref);
  return { ...b, payment_status: "paid" };
}

/** Capture an approved order and record it. */
export async function captureAndRecord(ref: string, orderId: string): Promise<"paid" | "failed"> {
  const b = await bookingByRef(ref);
  if (!b || b.paypal_order_id !== orderId) return "failed";
  if (b.payment_status === "paid") return "paid";
  const c = await captureOrder(orderId);
  if (c.completed && c.captureId) {
    await markPaid(ref, c.captureId, c.amountEur);
    return "paid";
  }
  if (c.already) {
    // The webhook captured it first; it will (or did) record the payment.
    const again = await bookingByRef(ref);
    return again?.payment_status === "paid" ? "paid" : "failed";
  }
  console.error(`[payments] ${ref}: capture failed (${c.status})`);
  // A retry from checkout creates a fresh booking, so this one is void.
  await supabaseAdmin()!.from("bookings").update({ status: "cancelled", payment_status: "failed" }).eq("ref", ref).eq("status", "pending_payment");
  return "failed";
}

/** Guest backed out of PayPal: the unpaid booking is void. */
export async function voidPending(ref: string) {
  await supabaseAdmin()!
    .from("bookings")
    .update({ status: "cancelled", payment_status: "failed" })
    .eq("ref", ref)
    .eq("status", "pending_payment");
}
