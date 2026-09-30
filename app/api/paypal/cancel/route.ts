import { NextResponse } from "next/server";
import { bookingByRef, voidPending } from "@/lib/payments";
import { REF_RE } from "@/lib/refs";

export const dynamic = "force-dynamic";

// Guest pressed "Cancel and return" on PayPal. Nothing was charged.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref") ?? "";
  if (!REF_RE.test(ref)) return NextResponse.redirect(new URL("/", url.origin));
  const b = await bookingByRef(ref);
  if (!b) return NextResponse.redirect(new URL("/", url.origin));
  await voidPending(ref);
  return NextResponse.redirect(new URL(`/book/${b.product_id}?payment=cancelled&ref=${ref}`, url.origin));
}
