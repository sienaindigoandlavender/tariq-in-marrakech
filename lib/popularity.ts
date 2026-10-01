import "server-only";
import { CITY } from "./config";
import { supabaseAdmin } from "./supabase/admin";

// Real social proof only: confirmed bookings in the last 7 days, per product. Never invented.
let memo: { at: number; p: Promise<Record<string, number>> } | null = null;

async function load(): Promise<Record<string, number>> {
  const admin = supabaseAdmin();
  if (!admin) return {};
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data, error } = await admin
    .from("bookings")
    .select("product_id")
    .eq("city", CITY)
    .gte("created_at", since)
    .not("status", "in", "(cancelled,pending_payment)")
    .limit(5000);
  if (error) return {};
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.product_id as string] = (out[r.product_id as string] ?? 0) + 1;
  return out;
}

export async function bookedThisWeek(): Promise<Record<string, number>> {
  if (!memo || Date.now() - memo.at > 10 * 60_000) memo = { at: Date.now(), p: load() };
  return memo.p;
}

/** Shown only from this many real bookings up. */
export const SOCIAL_MIN = 3;
