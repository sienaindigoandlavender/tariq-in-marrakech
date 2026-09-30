import { NextResponse } from "next/server";
import { captureAndRecord, markPaid } from "@/lib/payments";
import { verifyWebhook } from "@/lib/paypal";
import { REF_RE } from "@/lib/refs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Event = {
  event_type?: string;
  resource?: {
    id?: string;
    status?: string;
    custom_id?: string;
    amount?: { currency_code: string; value: string };
    purchase_units?: { custom_id?: string; reference_id?: string }[];
    links?: { rel: string; href: string }[];
  };
};

// Backstop for guests who close the tab before returning from PayPal, and for refunds
// made in the PayPal dashboard. Subscribe to: CHECKOUT.ORDER.APPROVED,
// PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.REFUNDED.
export async function POST(req: Request) {
  const event = (await req.json().catch(() => null)) as Event | null;
  if (!event || !supabaseAdmin()) return NextResponse.json({ ok: false }, { status: 400 });
  if (!(await verifyWebhook(req.headers, event))) return NextResponse.json({ ok: false }, { status: 401 });

  const r = event.resource ?? {};
  const ref = r.custom_id ?? r.purchase_units?.[0]?.custom_id ?? r.purchase_units?.[0]?.reference_id ?? "";

  if (event.event_type === "CHECKOUT.ORDER.APPROVED" && REF_RE.test(ref) && r.id) {
    await captureAndRecord(ref, r.id);
  } else if (event.event_type === "PAYMENT.CAPTURE.COMPLETED" && REF_RE.test(ref) && r.id) {
    await markPaid(ref, r.id, r.amount?.currency_code === "EUR" ? Number(r.amount.value) : null);
  } else if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
    // resource is the refund; its "up" link points at the capture.
    const captureId = r.links?.find((l) => l.rel === "up")?.href.split("/").pop();
    if (captureId) {
      await supabaseAdmin()!.from("bookings").update({ payment_status: "refunded", refunded_at: new Date().toISOString() }).eq("paypal_capture_id", captureId);
    }
  }
  return NextResponse.json({ ok: true });
}
