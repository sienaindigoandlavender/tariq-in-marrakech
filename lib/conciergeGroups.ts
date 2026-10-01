import type { Category } from "./types";

/** Sections of the Concierge page, in order. A product lands in the first group that lists it; kits by category. */
export const CONCIERGE_GROUPS: { id: string; h: string; ids?: string[]; category?: Category }[] = [
  { id: "beauty", h: "Wellness & beauty", ids: ["massage", "facial", "manicure", "pedicure", "blowout", "henna", "barber"] },
  { id: "health", h: "Health", ids: ["doctor"] },
  { id: "food", h: "Food & dining", ids: ["chef", "table"] },
  { id: "moments", h: "Moments", ids: ["photo"] },
  { id: "kits", h: "Kits & baby", category: "kit" },
];

export function groupConcierge<T extends { id: string; category: Category }>(list: T[]): { id: string; h: string; items: T[] }[] {
  const used = new Set<string>();
  const out = CONCIERGE_GROUPS.map((g) => {
    const items = list.filter((p) => !used.has(p.id) && (g.ids ? g.ids.includes(p.id) : p.category === g.category));
    items.forEach((p) => used.add(p.id));
    return { id: g.id, h: g.h, items };
  });
  const rest = list.filter((p) => !used.has(p.id));
  if (rest.length) out.push({ id: "more", h: "More", items: rest });
  return out.filter((g) => g.items.length);
}
