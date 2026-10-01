import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { SHOP_CATEGORIES } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    ...SHOP_CATEGORIES.map((c) => ({ url: `${SITE_URL}/c/${c}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/p/${p.id}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/c/all`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/concierge`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/plan`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/packages`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/private`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/booking-conditions`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
