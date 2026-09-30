import { NextResponse } from "next/server";
import { bookingByRef, captureAndRecord } from "@/lib/payments";
import { REF_RE } from "@/lib/refs";

export const dynamic = "force-dynamic";

// PayPal sends the guest back here after approval: ?ref=TRQ-XXXXX&token=<order id>&PayerID=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref") ?? "";
  const orderId = url.searchParams.get("token") ?? "";
  if (!REF_RE.test(ref) || !orderId) return NextResponse.redirect(new URL("/", url.origin));

  const result = await captureAndRecord(ref, orderId);
  if (result === "paid") return NextResponse.redirect(new URL(`/done/${ref}?payment=paid`, url.origin));

  const b = await bookingByRef(ref);
  const back = b ? `/book/${b.product_id}?payment=failed&ref=${ref}` : "/";
  return NextResponse.redirect(new URL(back, url.origin));
}
