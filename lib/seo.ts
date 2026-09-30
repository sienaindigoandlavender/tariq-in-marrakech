import type { Product } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")).replace(/\/$/, "");

const SMALL = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with", "from"]);

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.replace(/(^|-)([a-z])/g, (_m, a, b) => a + b.toUpperCase())))
    .join(" ");
}

/** "Ourika Valley Day Trip from Marrakech" (the layout template appends " | Tariq"). */
export function productSeoTitle(p: Pick<Product, "title" | "category">): string {
  const base = titleCase(p.title);
  if (/marrakech/i.test(base)) return base;
  return `${base} ${p.category === "exc" || p.category === "des" ? "from" : "in"} Marrakech`;
}
