import "server-only";
import { PACKAGES, type PackageDef } from "./plan";
import { price } from "./pricing";
import type { Product } from "./types";

export type PackageView = PackageDef & {
  products: { id: string; title: string }[];
  /** Sum of the included items for 2 guests, shared option, no extras, divided by 2. */
  fromPp: number;
};

/** Packages resolved against the live catalogue. Items missing from the catalogue are skipped. */
export function resolvePackages(products: Product[]): PackageView[] {
  return PACKAGES.map((pkg) => {
    const items = pkg.items.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
    const total = items.reduce((sum, p) => sum + price(p, { guests: 2, mode: "shared", addonIds: [] }).total, 0);
    return { ...pkg, products: items.map((p) => ({ id: p.id, title: p.title })), fromPp: Math.round(total / 2) };
  }).filter((p) => p.products.length >= 2);
}
