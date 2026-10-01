import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookSection } from "@/components/Explore";
import { TransferSearch } from "@/components/TransferSearch";
import { copy } from "@/lib/copy";
import { getProducts, recommended, toPublic } from "@/lib/db";
import { CATEGORIES, type Category } from "@/lib/types";

export const revalidate = 300;
export const dynamicParams = false;

const SEO: Record<Category | "all", { title: string; description: string }> = {
  all: { title: "Everything to Book in Marrakech", description: "Airport transfers, day trips, multi-day tours, activities, concierge services and trip kits in Marrakech. Pay on arrival." },
  exc: { title: "Day Trips from Marrakech", description: "Ourika, Ouzoud, Essaouira, Imlil and Aït Benhaddou day trips from Marrakech. Pickup at your riad, pay on arrival." },
  des: { title: "Multi-day Tours from Marrakech", description: "3-day Sahara tours to Merzouga, 4 days to Fes via the dunes, 2-day Zagora desert tours and a 2-day Atlas trek from Marrakech. Pay online or on arrival." },
  act: { title: "Activities in Marrakech", description: "Hot air balloon, Agafay dinner, quad biking and camel rides in Marrakech. Transfers included, pay on arrival." },
  tkt: { title: "Skip the Line in Marrakech: Bacha Coffee, Bahia Palace, Saadian Tombs", description: "Skip the queue in Marrakech: Bacha Coffee at opening, Bahia Palace, Saadian Tombs, El Badi, Ben Youssef and Le Jardin Secret with tickets bought for you and a host at the gate." },
  gft: { title: "Marrakech Gift Vouchers", description: "Give Marrakech: gift vouchers for transfers, day trips, desert tours, Skip the line and concierge services, sent on WhatsApp." },
  trf: { title: "Marrakech Airport and Inter-city Transfers", description: "Airport transfers and private transfers from Marrakech to Essaouira, Casablanca, Agafay, Imlil, Agadir, Rabat and Fes. Door to door, pay on arrival." },
  svc: { title: "Concierge Services in Marrakech: Massage, Beauty, Doctor, Chef", description: "Massage, facial, manicure, pedicure, blow-out, henna, barber, a doctor visit, private chef, restaurant tables, kits and baby gear at your riad in Marrakech." },
  kit: { title: "Trek Kits, Desert Kits and Baby Kits in Marrakech", description: "Trek and desert kits waiting in your van, and a baby kit delivered to your riad in Marrakech." },
};

export function generateStaticParams() {
  return ["all", ...CATEGORIES].map((category) => ({ category }));
}

export function generateMetadata({ params }: { params: { category: string } }): Metadata {
  const s = SEO[params.category as Category | "all"];
  if (!s) return {};
  return { title: s.title, description: s.description, alternates: { canonical: `/c/${params.category}` } };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  if (params.category !== "all" && !CATEGORIES.includes(params.category as Category)) notFound();
  const cat = params.category as Category | "all";
  const products = recommended(await getProducts()).map(toPublic);
  return (
    <div className="wrap">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">{copy.nav.explore}</Link> › <span aria-current="page">{cat === "all" ? copy.rails.browseAll : copy.categories[cat]}</span>
      </nav>
      {cat === "trf" ? (
        <div className="pt-6">
          <TransferSearch products={products.filter((p) => p.category === "trf")} />
        </div>
      ) : null}
      <BookSection products={products} initial={cat} heading={cat === "all" ? copy.rails.browseAll : copy.categories[cat]} />
    </div>
  );
}
