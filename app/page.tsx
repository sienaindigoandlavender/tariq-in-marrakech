import { CategoryTiles, Hero, How, Promises, Rail } from "@/components/Explore";
import { RAILS } from "@/lib/merch";
import { CATEGORIES, type Category, type Product } from "@/lib/types";
import { copy } from "@/lib/copy";
import { OPERATOR_WHATSAPP } from "@/lib/config";
import { getProducts, recommended, toPublic } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function ExplorePage() {
  const all = recommended(await getProducts());
  const byId = new Map(all.map((p) => [p.id, p]));
  const pick = (r: (typeof RAILS)[number]): Product[] =>
    r.best
      ? [...all.filter((p) => p.role === "cow" || p.badge), ...all.filter((p) => p.role === "lead")].slice(0, 4)
      : r.ids
        ? (r.ids.map((id) => byId.get(id)).filter(Boolean) as Product[])
        : all.filter((p) => p.category === r.category);
  const rails = RAILS.map((r) => ({ ...r, products: pick(r).map(toPublic) }));
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c, all.filter((p) => p.category === c).length])) as Record<Category, number>;
  const agency = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: `${copy.brand} ${copy.city}`,
    url: SITE_URL,
    telephone: `+${OPERATOR_WHATSAPP}`,
    description: "Marrakech airport transfers, day trips, desert tours and trip services. Pay on arrival, free cancellation up to 24 h.",
    address: { "@type": "PostalAddress", addressLocality: "Marrakech", addressCountry: "MA" },
    areaServed: { "@type": "City", name: "Marrakech" },
    paymentAccepted: "Cash, Credit Card",
    currenciesAccepted: "EUR, MAD",
    openingHours: "Mo-Su 08:00-22:00",
  };
  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(agency).replace(/</g, "\\u003c") }} />
      <Hero />
      <Promises />
      {rails.map((r) => (
        <Rail key={r.key} id={r.key} h={r.h} p={r.p} href={r.href} products={r.products} />
      ))}
      <CategoryTiles counts={counts} />
      <How />
    </div>
  );
}
