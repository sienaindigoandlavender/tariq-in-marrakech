import type { Metadata } from "next";
import Link from "next/link";
import { faqGroups } from "@/lib/faq";
import { paypalEnabled } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Paying, cancelling, pickups in the medina, Sahara vs Agafay, the private chef and more: quick answers for booking in Marrakech.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const groups = faqGroups(paypalEnabled() && supabaseAdmin() !== null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) => g.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))),
  };
  return (
    <div className="wrap pb-12">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › <span aria-current="page">FAQ</span>
      </nav>
      <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-10 pt-3 tab:grid-cols-1 tab:gap-4">
        <aside className="tab:hidden">
          <nav aria-label="FAQ topics" className="sticky top-[86px] grid gap-1 text-[15px]">
            {groups.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-[10px] px-3 py-2 font-bold text-muted no-underline hover:bg-soft hover:text-ink">
                {g.h}
              </a>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 max-w-[760px]">
          <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">Questions, answered</h1>
          <p className="m-0 mt-2 text-[17px] text-muted">
            Can&rsquo;t find it? Tap <b className="text-ink">Ask Tariq</b> at the bottom right, or <Link href="/contact">message us</Link>.
          </p>
          {groups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-[86px] pt-8">
              <h2 className="m-0 mb-3 text-xl font-extrabold">{g.h}</h2>
              <div className="divide-y divide-line rounded-card border border-line bg-surface">
                {g.items.map((f) => (
                  <details key={f.q} className="group px-4 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 py-3 text-[16px] font-bold">
                      {f.q}
                      <span aria-hidden="true" className="grid h-7 w-7 flex-none place-items-center rounded-full bg-soft text-lg transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="pb-4 text-[15.5px] text-muted">
                      <p className="m-0">{f.a}</p>
                      {f.link ? (
                        <Link href={f.link[0]} className="mt-2 inline-block font-bold">
                          {f.link[1]} →
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </div>
  );
}
