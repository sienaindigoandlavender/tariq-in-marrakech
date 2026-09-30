import type { Metadata } from "next";
import Link from "next/link";
import { PackageCard } from "@/components/PackageCard";
import { getProducts } from "@/lib/db";
import { resolvePackages } from "@/lib/packages";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Marrakech Trip Packages",
  description: "Ready-made Marrakech trips: desert escape, Atlas adventure, family, romantic and culture. Tell us your dates and we adapt the plan to your group.",
  alternates: { canonical: "/packages" },
};

export default async function PackagesPage() {
  const packages = resolvePackages(await getProducts());
  return (
    <div className="wrap pb-10">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › <span aria-current="page">Packages</span>
      </nav>
      <header className="max-w-[62ch] pb-6 pt-3">
        <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">Ready-made trips</h1>
        <p className="m-0 mt-2 text-[17px] text-muted">
          Each package is a starting point built from our own trips. Tell us your dates and group, and we adapt the days, pace and extras, then send the plan
          with prices on WhatsApp.
        </p>
      </header>
      <div className="grid grid-cols-3 gap-5 tab:grid-cols-2 phone:grid-cols-1">
        {packages.map((p) => (
          <PackageCard key={p.id} p={p} />
        ))}
        <article className="flex flex-col justify-between gap-4 rounded-card bg-soft p-6">
          <div>
            <h2 className="display m-0 text-[30px] leading-none">Something else in mind?</h2>
            <p className="m-0 mt-2 text-[15px] text-muted">A honeymoon, a big family, a week with a driver. Tell us what matters and we build it around you.</p>
          </div>
          <Link href="/plan" className="inline-flex min-h-[48px] items-center justify-center self-start rounded-full bg-ink px-5 font-extrabold text-bg no-underline">
            Plan my trip
          </Link>
        </article>
      </div>
    </div>
  );
}
