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
    addons: addons
      .map((a) => ({ ...(a as unknown as Addon), eur: Number(a.eur) }))
      .sort((a, b) => a.sort - b.sort),
  };
}

async function load(): Promise<Product[]> {
  if (!hasSupabase) {
    return (catalogue as unknown as Product[]).filter((p) => p.active && p.city === CITY);
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await sb
    .from("products")
    .select("*, product_addons(*)")
    .eq("city", CITY)
    .eq("active", true)
    .order("sort");
  if (error) throw new Error(`Catalogue load failed: ${error.message}`);
  return (data ?? []).map(({ product_addons, ...row }) =>
    normalise(row as Record<string, unknown>, (product_addons ?? []) as Record<string, unknown>[]),
  );
}

export async function getProducts(): Promise<Product[]> {
  return (await load()).sort((a, b) => a.sort - b.sort);
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await load()).find((p) => p.id === id) ?? null;
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
