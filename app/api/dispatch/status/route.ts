import { NextResponse } from "next/server";
import { getProduct } from "@/lib/db";
import { refundCapture } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { currentOperator } from "@/lib/supabase/server";
import type { BookingStatus } from "@/lib/types";

const ALLOWED: BookingStatus[] = ["confirmed", "reminded", "picked", "paid", "noshow", "cancelled"];

export async function POST(req: Request) {
  const op = await currentOperator();
  if (!op) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ref = typeof body.ref === "string" ? body.ref : "";
  const status = body.status as BookingStatus;
  if (!/^TRQ-[A-Z0-9]{5}$/.test(ref) || !ALLOWED.includes(status)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const admin = supabaseAdmin()!;

  const { data: b } = await admin.from("bookings").select("ref, status, payment_status, paypal_capture_id, product_id").eq("ref", ref).maybeSingle();
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (b.status === "pending_payment") return NextResponse.json({ error: "This booking hasn't been paid yet." }, { status: 409 });

  // Cancelling a prepaid booking refunds it in full (free cancellation). Refund first, then cancel.
  // Non-refundable products (private chef) keep the payment unless the operator explicitly refunds
  // (we cancelled, or goodwill).
  const patch: Record<string, unknown> = { status };
  const product = await getProduct(b.product_id);
  const refund = product && !product.refundable ? body.refund === true : body.refund !== false;
  if (status === "cancelled" && refund && b.payment_status === "paid" && b.paypal_capture_id) {
    const r = await refundCapture(b.paypal_capture_id, ref);
    if (!r.ok) return NextResponse.json({ error: `PayPal refund failed (${r.status}). Nothing was changed.` }, { status: 502 });
    patch.payment_status = "refunded";
    patch.refunded_at = new Date().toISOString();
  }

  const { data, error } = await admin.from("bookings").update(patch).eq("ref", ref).select("ref, status, payment_status").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
