import { NextResponse } from "next/server";
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
  const { data, error } = await admin.from("bookings").update({ status }).eq("ref", ref).select("ref, status").maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
