import "server-only";
import { createClient } from "@supabase/supabase-js";
import catalogue from "@/data/catalogue.json";
import { CITY } from "./config";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./supabase/env";
import type { Addon, Category, Product, PublicProduct } from "./types";

// Typed, read-only catalogue access. Reads use the anon key (RLS: active rows only).
// Without a configured Supabase project, the seed catalogue in data/catalogue.json is served.

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

function normalise(row: Record<string, unknown>, addons: Record<string, unknown>[]): Product {
  return {
    ...(row as unknown as Product),
    km: Number(row.km ?? 0),
    price_eur: Number(row.price_eur),
    was_eur: num(row.was_eur),
    cap: num(row.cap),
    private_per_car: num(row.private_per_car),
    itinerary: Array.isArray(row.itinerary) ? (row.itinerary as Product["itinerary"]) : [],
    addons: addons
      .map((a) => ({ ...(a as unknown as Addon), eur: Number(a.eur) }))
      .sort((a, b) => a.sort - b.sort),
  };
}

const local = () => (catalogue as unknown as Product[]).filter((p) => p.active && p.city === CITY);

async function load(): Promise<Product[]> {
  if (!hasSupabase) return local();
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("products")
    .select("*, product_addons(*)")
    .eq("city", CITY)
    .eq("active", true)
    .order("sort");
  if (error) {
    // Schema not created or not seeded yet: serve the seed catalogue so builds and pages still work,
    // and say so loudly in the logs. Any other error is real and must fail.
    const missing = error.code === "PGRST205" || error.code === "42P01" || /could not find the table|does not exist/i.test(error.message);
    if (missing) {
      console.warn("[tariq] Supabase has no products table yet. Serving data/catalogue.json. Run supabase/migrations/*.sql then supabase/seed.sql.");
      return local();
    }
    throw new Error(`Catalogue load failed: ${error.message}`);
  }
  if (!data?.length) {
    console.warn("[tariq] Supabase products table is empty. Serving data/catalogue.json. Run supabase/seed.sql.");
    return local();
  }
  return (data ?? []).map(({ product_addons, ...row }) =>
    normalise(row as Record<string, unknown>, (product_addons ?? []) as Record<string, unknown>[]),
  );
}

// One load per server instance per minute; pages still revalidate on their own schedule.
let memo: { at: number; p: Promise<Product[]> } | null = null;

export async function getProducts(): Promise<Product[]> {
  if (!memo || Date.now() - memo.at > 60_000) {
    const p = load().then((l) => l.sort((a, b) => a.sort - b.sort));
    memo = { at: Date.now(), p };
    p.catch(() => (memo = null));
  }
  return [...(await memo.p)];
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

export async function getProductsByCategory(cat: Category): Promise<Product[]> {
  return (await getProducts()).filter((p) => p.category === cat);
}

/** Strip the internal role before handing products to client components. */
export function toPublic(p: Product): PublicProduct {
  const rest: Partial<Product> = { ...p };
  delete rest.role;
  return rest as PublicProduct;
}

/** "Recommended" order: cows and badged first, then leads, then by sort. */
export function recommended(list: Product[]): Product[] {
  const rank = (p: Product) => (p.role === "cow" || p.badge ? 0 : p.role === "lead" ? 1 : 2);
  return [...list].sort((a, b) => rank(a) - rank(b) || a.sort - b.sort);
}
