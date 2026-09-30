import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookSection } from "@/components/Explore";
import { copy } from "@/lib/copy";
import { getProducts, recommended, toPublic } from "@/lib/db";
import { CATEGORIES, type Category } from "@/lib/types";

export const revalidate = 300;
export const dynamicParams = false;

const SEO: Record<Category, { title: string; description: string }> = {
  exc: { title: "Day Trips from Marrakech", description: "Ourika, Ouzoud, Essaouira, Imlil and Aït Benhaddou day trips from Marrakech. Pickup at your riad, pay on arrival." },
  des: { title: "Desert Tours from Marrakech", description: "3-day Sahara trips to Merzouga and 2-day Zagora desert tours from Marrakech. Pay on arrival, free cancellation." },
  act: { title: "Activities in Marrakech", description: "Hot air balloon, Agafay dinner, quad biking and camel rides in Marrakech. Transfers included, pay on arrival." },
  trf: { title: "Marrakech Airport Transfers and Rides", description: "Airport transfers, last-day bag storage in the van and dinner rides in Marrakech. Flight tracked, pay on arrival." },
  svc: { title: "At Your Riad in Marrakech", description: "Henna artist, massage and private chef dinner at your riad in Marrakech. Pay on the day." },
  kit: { title: "Trek Kits, Desert Kits and Baby Kits in Marrakech", description: "Trek and desert kits waiting in your van, and a baby kit delivered to your riad in Marrakech." },
};

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const s = SEO[params.category as Category];
  if (!s) return {};
  return { title: s.title, description: s.description, alternates: { canonical: `/c/${params.category}` } };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  if (!CATEGORIES.includes(params.category as Category)) notFound();
  const cat = params.category as Category;
  const products = recommended(await getProducts()).map(toPublic);
  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">{copy.nav.explore}</Link> › <span aria-current="page">{copy.categories[cat]}</span>
      </nav>
      <BookSection products={products} initial={cat} heading={copy.categories[cat]} />
    </div>
  );
}
