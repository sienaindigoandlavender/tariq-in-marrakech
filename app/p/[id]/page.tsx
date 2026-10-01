import { rules } from "@/lib/rules";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingBox, MobileBookBar } from "@/components/BookingBox";
import { BookingSheetRoot } from "@/components/booking/BookingSheet";
import { Icon } from "@/components/Icons";
import { Poster } from "@/components/Poster";
import { ProductCard, Heart } from "@/components/ProductCard";
import { copy } from "@/lib/copy";
import { getProduct, getProducts, toPublic } from "@/lib/db";
import { SITE_URL, productSeoTitle } from "@/lib/seo";
import type { Product } from "@/lib/types";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id);
  if (!p) return {};
  return {
    title: productSeoTitle(p),
    description: `${p.blurb} ${p.timing}. From €${p.price_eur}. ${p.prepay_only ? "Book online" : "Pay on arrival"}${p.refundable ? ", free cancellation up to 24 h" : ""}.`,
    alternates: { canonical: `/p/${p.id}` },
    openGraph: { title: productSeoTitle(p), description: p.blurb, type: "website", images: p.image_url ? [p.image_url] : undefined },
  };
}

function facts(p: Product): { icon: Parameters<typeof Icon>[0]["name"]; label: string }[] {
  const f: { icon: Parameters<typeof Icon>[0]["name"]; label: string }[] = [{ icon: "clock", label: p.duration }];
  if (p.category === "svc") f.push({ icon: "pin", label: copy.product.factAtRiad });
  else if (p.category === "tkt") f.push({ icon: "pin", label: "Host at the gate" });
  else if (p.category === "kit") f.push({ icon: "pin", label: copy.product.factDelivered });
  else f.push({ icon: "pin", label: copy.product.factPickup });
  if (p.category === "svc") f.push({ icon: "users", label: "Just your group" });
  else if (p.per === "car") f.push({ icon: "users", label: copy.product.factPrivateCar });
  else if (p.private_per_car) f.push({ icon: "users", label: copy.product.factSharedPrivate });
  else if (p.category !== "kit" && p.category !== "tkt") f.push({ icon: "users", label: copy.product.factShared });
  const r = rules(p);
  f.push({ icon: "shield", label: r.cancelFact }, { icon: "wallet", label: r.payFact });
  if (r.leadNote) f.push({ icon: "clock", label: r.leadNote });
  return f;
}

function alsoLike(p: Product, all: Product[]): Product[] {
  const others = all.filter((x) => x.id !== p.id);
  const picks = [
    ...others.filter((x) => x.category === p.category),
    ...others.filter((x) => x.role === "cow"),
    ...others,
  ];
  return [...new Map(picks.map((x) => [x.id, x])).values()].slice(0, 4);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-6">
      <h2 className="m-0 mb-3 text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const p = await getProduct(params.id);
  if (!p) notFound();
  const all = await getProducts();
  const pub = toPublic(p);
  const inMedinaOrRiad = p.category !== "kit";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.blurb,
    category: copy.categories[p.category],
    url: `${SITE_URL}/p/${p.id}`,
    ...(p.image_url ? { image: p.image_url } : {}),
    brand: { "@type": "Brand", name: copy.brand },
    offers: {
      "@type": "Offer",
      price: p.price_eur.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/p/${p.id}`,
      seller: { "@type": "TravelAgency", name: `${copy.brand} ${copy.city}` },
    },
  };

  return (
    <BookingSheetRoot p={pub}>
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">{copy.nav.explore}</Link> › <Link href={`/c/${p.category}`}>{copy.categories[p.category]}</Link>
      </nav>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-10 pt-3 tab:grid-cols-[minmax(0,1fr)_300px] tab:gap-6 phone:grid-cols-1">
        <div className="min-w-0">
          <header className="mb-4 grid gap-1.5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-muted">
              <span>{p.subtitle}</span>
              {p.badge ? <span className="rounded-full bg-sun px-2.5 py-0.5 text-xs font-extrabold text-sun-ink">{p.badge}</span> : null}
            </div>
            <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">{p.title}</h1>
          </header>

          <div className="relative">
            <Poster scene={p.scene} image_url={p.image_url} alt={p.title} uid={`hero-${p.id}`} className="!aspect-[16/9] rounded-[20px]" />
            <Heart id={p.id} className="absolute right-1.5 top-1.5" />
          </div>

          <ul aria-label={copy.product.keyFacts} className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0 py-5 text-[14.5px] font-bold">
            {facts(p).map((f) => (
              <li key={f.label + f.icon} className="inline-flex items-center gap-2">
                <span className="text-blue">
                  <Icon name={f.icon} />
                </span>
                {f.label}
              </li>
            ))}
          </ul>

          <Section title={copy.product.highlights}>
            <ul className="m-0 grid list-none gap-2 p-0">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-2.5">
                  <span className="mt-2 h-2 w-2 flex-none rounded-full bg-sun" />
                  {h}
                </li>
              ))}
            </ul>
          </Section>

          {p.itinerary.length ? (
            <Section title={copy.product.itinerary}>
              <ol className="m-0 grid list-none gap-0 p-0">
                {p.itinerary.map((step, i) => (
                  <li key={step.t + i} className="relative grid grid-cols-[112px_minmax(0,1fr)] gap-4 pb-4 last:pb-0 xs:grid-cols-[84px_minmax(0,1fr)] xs:gap-3">
                    <span className="tnum pt-px text-sm font-extrabold text-blue">{step.t}</span>
                    <span className="relative pl-5 before:absolute before:left-0 before:top-[7px] before:h-2.5 before:w-2.5 before:rounded-full before:border-2 before:border-blue before:bg-surface before:content-[''] after:absolute after:bottom-[-16px] after:left-[4px] after:top-[20px] after:w-0.5 after:bg-line after:content-[''] [li:last-child_&]:after:hidden">
                      {step.s}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          ) : null}

          <Section title={copy.product.about}>
            <p className="m-0">{p.blurb}</p>
            <p className="m-0 mt-2 font-bold">{p.timing}</p>
          </Section>

          <section className="grid grid-cols-2 gap-6 border-t border-line py-6 xs:grid-cols-1">
            <div>
              <h2 className="m-0 mb-3 text-xl font-extrabold">{copy.product.includes}</h2>
              <ul className="m-0 grid list-none gap-2 p-0">
                {p.includes.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-0.5 text-ok"><Icon name="check" size={18} /></span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            {p.excludes.length ? (
              <div>
                <h2 className="m-0 mb-3 text-xl font-extrabold">{copy.product.excludes}</h2>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {p.excludes.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="mt-0.5 text-muted"><Icon name="x" size={18} /></span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {inMedinaOrRiad ? (
            <Section title={copy.product.pickupH}>
              <div className="grid gap-2">
                <p className="m-0">{copy.product.pickupRiad}</p>
                <p className="m-0">{copy.product.pickupMedina}</p>
                <p className="m-0 text-muted">{copy.product.pickupTime}</p>
              </div>
            </Section>
          ) : null}

          {p.know_before.length ? (
            <Section title={copy.product.know}>
              <ul className="m-0 grid list-disc gap-1.5 pl-5">
                {p.know_before.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            </Section>
          ) : null}
          <p className="m-0 mt-6 text-[15px] text-muted">
            More questions? See the <Link href="/faq">FAQ</Link> or{" "}
            <Link href={p.refundable ? "/booking-conditions#cancel-you" : "/booking-conditions#non-refundable"}>cancellation terms</Link>.
          </p>
        </div>

        <div className="phone:hidden">
          <BookingBox p={pub} />
        </div>
      </div>

      <section className="border-t border-line pb-4 pt-8">
        <h2 className="display m-0 mb-4 text-[30px]">{copy.product.alsoLike}</h2>
        <div className="grid grid-cols-4 gap-x-[18px] gap-y-6 tab:grid-cols-2 phone:gap-x-3">
          {alsoLike(p, all).map((x) => (
            <ProductCard key={x.id} p={toPublic(x)} uid={`al-${x.id}`} />
          ))}
        </div>
      </section>

      {/* keeps the last content clear of the phone booking bar */}
      <div className="hidden h-[72px] phone:block" />
      <MobileBookBar p={pub} />
    </div>
    </BookingSheetRoot>
  );
}
