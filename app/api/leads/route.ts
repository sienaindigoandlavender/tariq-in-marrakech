import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CITY } from "@/lib/config";
import { addDays, isYmd, today } from "@/lib/dates";
import { BUDGETS, NEEDS, STYLES, packageById } from "@/lib/plan";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { makeRef } from "@/lib/refs";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const bad = (error: string, field?: string, status = 400) => NextResponse.json({ error, field }, { status });
const oneOf = <T extends readonly { id: string }[]>(list: T, v: unknown) => (list.some((x) => x.id === v) ? (v as string) : null);

export async function POST(req: Request) {
  if (!rateLimit("lead:" + clientIp(req), 5, 10 * 60_000)) return bad("Too many requests from this connection. Message us on WhatsApp.", undefined, 429);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid request.");
  }

  const arrival = str(body.arrival, 10) || null;
  const departure = str(body.departure, 10) || null;
  if (arrival && (!isYmd(arrival) || arrival < today() || arrival > addDays(today(), 540))) return bad("Choose an arrival date from today onwards.", "arrival");
  if (departure && (!isYmd(departure) || (arrival && departure < arrival))) return bad("The departure date must be after the arrival date.", "departure");

  const adults = Number(body.adults);
  const children = Number(body.children ?? 0);
  if (!Number.isInteger(adults) || adults < 1 || adults > 30) return bad("Choose between 1 and 30 adults.", "adults");
  if (!Number.isInteger(children) || children < 0 || children > 20) return bad("Choose up to 20 children.", "children");

  const style = oneOf(STYLES, body.style);
  const needs = Array.isArray(body.needs) ? [...new Set(body.needs.filter((n): n is string => NEEDS.some((x) => x.id === n)))] : [];
  const budget = oneOf(BUDGETS, body.budget);
  const pkg = packageById(str(body.package_id, 40));

  const lead_name = str(body.lead_name, 120);
  if (lead_name.length < 2) return bad("Add your name.", "lead_name");
  const phone = str(body.phone, 40);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) return bad("Add a WhatsApp number with country code, for example +33 6 12 34 56 78.", "phone");
  const email = str(body.email, 160) || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Check the email address, or leave it empty.", "email");
  const notes = str(body.notes, 1500) || null;

  const admin = supabaseAdmin();
  let partner_code: string | null = null;
  const cookieCode = cookies().get("tq_partner")?.value?.toUpperCase();
  if (cookieCode && admin) {
    const { data } = await admin.from("partners").select("code").eq("code", cookieCode).eq("active", true).eq("city", CITY).maybeSingle();
    partner_code = data?.code ?? null;
  }
  const source = partner_code ? "riad_qr" : body.source === "concierge" ? "concierge" : "web";

  const lead = {
    city: CITY,
    arrival,
    departure,
    adults,
    children,
    style,
    needs,
    budget,
    package_id: pkg?.id ?? null,
    lead_name,
    phone,
    email,
    notes,
    partner_code,
    source,
  };

  let ref = makeRef("PLN");
  let stored = false;
  if (admin) {
    for (let i = 0; i < 3 && !stored; i++) {
      const { error } = await admin.from("leads").insert({ ...lead, ref });
      if (!error) stored = true;
      else if (error.code === "23505") ref = makeRef("PLN");
      else {
        console.error("lead insert failed", error);
        break;
      }
    }
    if (!stored) return bad("We couldn't save your request. Please try again, or message us on WhatsApp.", undefined, 500);
  }

  return NextResponse.json({ ref, stored });
}
