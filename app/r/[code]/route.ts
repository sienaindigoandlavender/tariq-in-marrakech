import { NextResponse } from "next/server";
import { CITY } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Riad QR entry: remember the partner for 30 days, then send the guest to Explore.
export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code.toUpperCase();
  const res = NextResponse.redirect(new URL("/", req.url));
  if (!/^[A-Z0-9]{3,12}$/.test(code)) return res;

  const admin = supabaseAdmin();
  if (admin) {
    const { data } = await admin.from("partners").select("code").eq("code", code).eq("city", CITY).eq("active", true).maybeSingle();
    if (!data) return res;
  }
  res.cookies.set("tq_partner", code, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
