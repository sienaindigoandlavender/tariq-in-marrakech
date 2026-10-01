import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, recommended, toPublic } from "@/lib/db";
import { hasPrivate } from "@/lib/pricing";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Private and Tailor-made Tours from Marrakech",
  description: "Private day trips, desert tours and activities from Marrakech with your own car, driver and guide, or a tailor-made trip designed around you.",
  alternates: { canonical: "/private" },
};

export default async function PrivatePage() {
  const tours = recommended(await getProducts())
    .filter((p) => ["exc", "des", "act"].includes(p.category) && hasPrivate(p))
    .map(toPublic);
  return (
    <div className="wrap pb-16">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › <span aria-current="page">Private tours</span>
      </nav>

      <header className="max-w-[720px] pt-6">
        <h1 className="display m-0 text-[clamp(36px,5vw,56px)] leading-[.95]">Private tours</h1>
        <p className="m-0 mt-4 text-[18px] text-muted">Your own car, driver and guide. Your pace, your stops, nobody else&rsquo;s schedule.</p>
      </header>

      <section className="mt-12 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 rounded-card bg-soft p-8 phone:grid-cols-1 phone:p-6">
        <div>
          <h2 className="m-0 text-2xl font-extrabold">Tailor-made, built around you</h2>
          <p className="m-0 mt-2 max-w-[60ch] text-[16px] text-muted">
            A honeymoon, a family with grandparents, a photographer&rsquo;s route, five days that aren&rsquo;t on any list. Tell us your dates and ideas. A real
            person designs it with you and sends the plan and price on WhatsApp. Free, no obligation.
          </p>
        </div>
        <Link href="/plan?private=1" className="inline-flex min-h-[52px] items-center justify-center whitespace-nowrap rounded-full bg-blue px-6 font-extrabold text-blue-ink no-underline">
          Design my private tour
        </Link>
      </section>

      <section className="pt-16">
        <h2 className="display m-0 text-[32px] leading-none">Book a private version</h2>
        <p className="m-0 mt-2 text-[15px] text-muted">Choose Private when you book. Same trip, just your group.</p>
        <div className="mt-8 grid grid-cols-4 gap-x-6 gap-y-12 tab:grid-cols-3 phone:grid-cols-2 phone:gap-x-3 phone:gap-y-8">
          {tours.map((p) => (
            <ProductCard key={p.id} p={p} uid={`pv-${p.id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
