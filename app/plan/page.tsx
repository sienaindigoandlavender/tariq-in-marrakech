import type { Metadata } from "next";
import Link from "next/link";
import { PlanForm } from "@/components/PlanForm";
import { getProducts } from "@/lib/db";
import { packageById } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Plan My Trip",
  description: "Tell us your dates, group and budget. We build your Marrakech trip — transfers, day trips, desert, activities — and send a plan with prices on WhatsApp.",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage({ searchParams }: { searchParams: { package?: string } }) {
  const pkg = packageById(searchParams.package);
  const products = await getProducts();
  const pkgItems = pkg ? pkg.items.map((id) => products.find((p) => p.id === id)?.title).filter((t): t is string => Boolean(t)) : [];

  return (
    <div className="wrap pb-10">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › {pkg ? <><Link href="/packages">Packages</Link> › </> : null}
        <span aria-current="page">Plan my trip</span>
      </nav>
      <div className="grid grid-cols-[minmax(0,1fr)_320px] gap-10 pt-3 tab:grid-cols-1 tab:gap-6">
        <div className="min-w-0">
          <header className="mb-5">
            {pkg ? <p className="m-0 mb-1 text-sm font-extrabold uppercase tracking-[.06em] text-blue">Plan this trip · {pkg.days}</p> : null}
            <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">{pkg ? pkg.title : "Plan my trip"}</h1>
            <p className="m-0 mt-2 max-w-[60ch] text-[17px] text-muted">
              Two minutes. Tell us your dates, who&rsquo;s coming and what you want. We build the plan and send it with prices on WhatsApp.
            </p>
          </header>
          <PlanForm pkg={pkg} pkgItems={pkgItems} />
        </div>
        <aside>
          <div className="sticky top-[86px] grid gap-4 rounded-card bg-soft p-5">
            <h2 className="m-0 text-lg font-extrabold">How it works</h2>
            <ol className="m-0 grid list-none gap-3 p-0 text-[15px]">
              {[
                ["Send your request", "Free and with no obligation."],
                ["Get your plan", "A real person replies on WhatsApp with a plan and prices."],
                ["Confirm what you like", "Pay online or on the day. Most bookings cancel free up to 24 h."],
              ].map(([b, s], i) => (
                <li key={b} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
                  <span className="tnum grid h-7 w-7 place-items-center rounded-full bg-blue text-sm font-extrabold text-blue-ink">{i + 1}</span>
                  <span>
                    <b className="block">{b}</b>
                    <span className="text-muted">{s}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="m-0 border-t border-line pt-3 text-sm text-muted">
              Know what you want already? <Link href="/c/all">Book single trips</Link> in a minute.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
