import { BookSection, Hero, How, Promises, Solved } from "@/components/Explore";
import { copy } from "@/lib/copy";
import { OPERATOR_WHATSAPP } from "@/lib/config";
import { getProducts, recommended, toPublic } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 300;

export default async function ExplorePage() {
  const products = recommended(await getProducts()).map(toPublic);
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
      <BookSection products={products} />
      <Solved products={products} />
      <How />
    </div>
  );
}
