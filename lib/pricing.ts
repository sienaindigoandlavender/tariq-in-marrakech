// Pricing rules from the brief, section 3. Pure: shared by the checkout UI and the server.
// Only the server's result is ever stored.

type PricedAddon = { id: string; label: string; eur: number; per: "pp" | "car" | "unit" };
type PricedProduct = {
  price_eur: number;
  per: "pp" | "car" | "flat";
  cap: number | null;
  private_per_car: number | null;
  private_pp?: number | null;
  addons: PricedAddon[];
};

export type PriceInput = { guests: number; mode: "shared" | "private"; addonIds: string[] };

export type PriceLine = {
  kind: "base" | "private" | "addon";
  id: string;
  label: string;
  qty: number;
  unit_eur: number;
  eur: number;
};

export type PriceResult = {
  cars: number;
  lines: PriceLine[];
  base: number;
  extra: number;
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function cars(p: { cap: number | null }, guests: number): number {
  return Math.max(1, Math.ceil(guests / (p.cap ?? 4)));
}

/** True when the product has a private option, priced per car or per person. */
export const hasPrivate = (p: { private_per_car: number | null; private_pp?: number | null }) => Boolean(p.private_per_car || p.private_pp);

export function price(p: PricedProduct, o: PriceInput): PriceResult {
  const g = o.guests;
  const c = cars(p, g);
  const lines: PriceLine[] = [];

  const privatePp = o.mode === "private" && p.private_pp ? p.private_pp : null;
  const baseQty = privatePp || p.per === "pp" ? g : p.per === "car" ? c : 1;
  const unit = privatePp ?? p.price_eur;
  const base = round2(unit * baseQty);
  lines.push({ kind: "base", id: "base", label: privatePp ? "Private" : "Booking", qty: baseQty, unit_eur: unit, eur: base });

  if (o.mode === "private" && !privatePp && p.private_per_car) {
    lines.push({ kind: "private", id: "private", label: "Private", qty: c, unit_eur: p.private_per_car, eur: round2(p.private_per_car * c) });
  }

  const chosen = new Set(o.addonIds);
  for (const a of p.addons) {
    if (!chosen.has(a.id)) continue;
    const qty = a.per === "pp" ? g : a.per === "car" ? c : 1;
    lines.push({ kind: "addon", id: a.id, label: a.label, qty, unit_eur: a.eur, eur: round2(a.eur * qty) });
  }

  const total = round2(lines.reduce((s, l) => s + l.eur, 0));
  return { cars: c, lines, base, extra: round2(total - base), total };
}
