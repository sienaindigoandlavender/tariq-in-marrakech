import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { copy } from "@/lib/copy";
import { CITY } from "@/lib/config";
import { isYmd, tomorrow, addDays, today, fmtDate } from "@/lib/dates";
import { getProduct } from "@/lib/db";
import { hasPrivate, price } from "@/lib/pricing";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { createOrder, paypalEnabled } from "@/lib/paypal";
import { makeRef } from "@/lib/refs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Booking, BookingSource } from "@/lib/types";

export const dynamic = "force-dynamic";

const E = copy.checkout.errors;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (error: string, field?: string, status = 400) => NextResponse.json({ error, field }, { status });

export async function POST(req: Request) {
  if (!rateLimit("book:" + clientIp(req), 10, 10 * 60_000)) return bad("Too many bookings from this connection. Message us on WhatsApp.", undefined, 429);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }

  const product = await getProduct(str(body.product_id, 40));
  if (!product) return bad("This product is not available.");

  // Validate. Any client-sent total is ignored: the server prices the booking itself.
  const date = str(body.date, 10);
  if (!isYmd(date) || date < tomorrow() || date > addDays(tomorrow(), 400)) return bad(E.date, "date");
  const earliest = addDays(today(), Math.max(1, product.lead_days));
  if (date < earliest) return bad(`${product.title} needs at least ${product.lead_days} days' notice. Choose ${fmtDate(earliest)} or later.`, "date");
  const guests = Number(body.guests);
  const maxGuests = product.per === "car" ? 9 : 14;
  if (!Number.isInteger(guests) || guests < 1 || guests > maxGuests) return bad("Choose between 1 and " + maxGuests + " guests.", "guests");
  const mode = body.mode === "private" && hasPrivate(product) ? "private" : "shared";
  const addonIds = Array.isArray(body.addon_ids) ? body.addon_ids.filter((x): x is string => typeof x === "string").slice(0, 20) : [];
  const pickup = str(body.pickup, 200);
  if (pickup.length < 3) return bad(E.pickup, "pickup");
  const lead_name = str(body.lead_name, 120);
  if (lead_name.length < 2) return bad(E.name, "lead_name");
  const phone = str(body.phone, 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) return bad(E.phone, "phone");
  const notes = str(body.notes, 1000) || null;
  const payNowAsked = body.payment === "paypal";

  const r = price(product, { guests, mode, addonIds });
  // Free services (restaurant table booking) never go to PayPal.
  const payNow = payNowAsked && r.total > 0;

  // Riad QR attribution: only a known, active partner code counts.
  const admin = supabaseAdmin();
  if (product.prepay_only && !payNow) return bad("This service is paid online when you book.", "payment");
  if (payNow && (!admin || !paypalEnabled()))
    return bad(
      product.prepay_only ? "Online payment isn't available right now. Message us on WhatsApp to book this one." : "Online payment isn't available right now. Choose pay on the day.",
      "payment",
      503,
    );
  let partner_code: string | null = null;
  const cookieCode = cookies().get("tq_partner")?.value?.toUpperCase();
  if (cookieCode && admin) {
    const { data } = await admin.from("partners").select("code").eq("code", cookieCode).eq("active", true).eq("city", CITY).maybeSingle();
    partner_code = data?.code ?? null;
  }
  const requested = body.source === "concierge" ? "concierge" : "web";
  const source: BookingSource = partner_code ? "riad_qr" : requested;

  const booking: Omit<Booking, "ref" | "created_at" | "payment_method" | "payment_status" | "paid_eur"> = {
    city: CITY,
    product_id: product.id,
    product_title: product.title,
    role: product.role,
    date,
    guests,
    mode,
    addons: r.lines
      .filter((l) => l.kind === "addon")
      .map((l) => ({ id: l.id, label: l.label, eur: l.unit_eur, qty: l.qty, line_eur: l.eur })),
    pickup,
    lead_name,
    phone,
    notes,
    base_eur: r.base,
    extra_eur: r.extra,
    total_eur: r.total,
    status: payNow ? "pending_payment" : "confirmed",
    source,
    partner_code,
  };
  const payment = payNow
    ? { payment_method: "paypal", payment_status: "pending" }
    : { payment_method: "on_arrival", payment_status: "unpaid" };

  let ref = makeRef();
  let persisted = false;
  if (admin) {
    for (let i = 0; i < 4; i++) {
      const { error } = await admin.from("bookings").insert({ ...booking, ...payment, ref });
      if (!error) {
        persisted = true;
        break;
      }
      if (error.code === "23505") {
        ref = makeRef();
        continue;
      }
      console.error("booking insert failed", error);
      return bad("We couldn't save your booking. Please try again, or message us on WhatsApp.", undefined, 500);
    }
    if (!persisted) return bad("We couldn't save your booking. Please try again.", undefined, 500);
  } else {
    console.warn(`[bookings] Supabase not configured: ${ref} was not stored. The guest's WhatsApp message is the only record.`);
  }

  let approve_url: string | null = null;
  if (payNow && admin) {
    const origin = new URL(req.url).origin;
    try {
      const o = await createOrder({
        ref,
        description: `${product.title}, ${date}, ${guests} ${guests === 1 ? "guest" : "guests"}`,
        totalEur: r.total,
        returnUrl: `${origin}/api/paypal/return?ref=${ref}`,
        cancelUrl: `${origin}/api/paypal/cancel?ref=${ref}`,
      });
      await admin.from("bookings").update({ paypal_order_id: o.orderId }).eq("ref", ref);
      approve_url = o.approveUrl;
    } catch (e) {
      console.error("[bookings] PayPal order failed", e);
      await admin.from("bookings").update({ status: "cancelled", payment_status: "failed" }).eq("ref", ref);
      return bad("We couldn't reach PayPal. Try again, or choose pay on the day.", "payment", 502);
    }
  }

  return NextResponse.json({
    persisted,
    approve_url,
    payment: payment.payment_method,
    booking: {
      ref,
      product_id: booking.product_id,
      product_title: booking.product_title,
      date,
      guests,
      mode,
      pickup,
      lead_name,
      phone,
      notes,
      base_eur: r.base,
      extra_eur: r.extra,
      total_eur: r.total,
      lines: r.lines.map((l) => ({ kind: l.kind, label: l.label, qty: l.qty, unit_eur: l.unit_eur, eur: l.eur })),
    },
  });
}
