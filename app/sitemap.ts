import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { CATEGORIES } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...CATEGORIES.map((c) => ({ url: `${SITE_URL}/c/${c}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/p/${p.id}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/concierge`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
