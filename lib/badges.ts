import type { Product } from "./types";

type B = Pick<Product, "category" | "per" | "private_per_car" | "tags">;

/** Product tags set in the catalogue. Only set a tag when it is true for every departure. */
export const TAGS: Record<string, string> = {
  "small-group": "Small group, max 8",
  sunrise: "Sunrise",
  sunset: "Sunset",
  family: "Family-friendly",
  "age-5": "Age 5+",
  english: "English-speaking guide",
  "female-ok": "Female driver or guide on request",
};

/** The international cues travellers scan for, in priority order. Derived from the product where possible. */
export function badges(p: B): string[] {
  const out: string[] = [];
  const tags = p.tags ?? [];
  if (p.category === "tkt") out.push("Skip the line");
  if (p.category === "svc") out.push("Comes to you");
  if (["exc", "des", "act"].includes(p.category)) out.push("Hotel pickup");
  if (p.category === "trf" || p.per === "car") out.push("Private");
  else if (p.private_per_car) out.push("Private option");
  for (const t of tags) if (TAGS[t]) out.push(TAGS[t]);
  return [...new Set(out)];
}
