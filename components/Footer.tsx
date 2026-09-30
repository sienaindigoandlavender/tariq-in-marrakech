import Link from "next/link";
import { copy } from "@/lib/copy";
import { formatWhatsapp } from "@/lib/config";
import { LEGAL, legalName } from "@/lib/legal";

const cols: { h: string; links: [string, string][] }[] = [
  {
    h: "Book",
    links: [
      ["/c/trf", "Airport & transfers"],
      ["/c/exc", "Day trips"],
      ["/c/des", "Tours & journeys"],
      ["/c/act", "Activities"],
      ["/c/svc", "Concierge services"],
      ["/c/kit", "Kits & baby"],
    ],
  },
  {
    h: "Help",
    links: [
      ["/plan", "Plan my trip"],
      ["/packages", "Packages"],
      ["/contact", "Contact"],
      ["/faq", "FAQ"],
      ["/account", "Wishlist & account"],
      ["/trip", "My trip"],
      ["/booking-conditions#cancel-you", "Cancellation"],
    ],
  },
  {
    h: "Legal",
    links: [
      ["/booking-conditions", "Booking conditions"],
      ["/privacy", "Privacy policy"],
      ["/terms", "Terms of use"],
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-line bg-soft pb-[34px] pt-10 text-sm text-muted print:hidden phone:pb-[calc(var(--tabh)+34px)]">
      <div className="wrap grid grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] gap-8 tab:grid-cols-3 xs:grid-cols-2">
        <div className="grid content-start gap-3 tab:col-span-3 xs:col-span-2">
          <span className="display text-[26px] text-ink">{copy.footer.tagline}</span>
          <p className="m-0 max-w-[34ch] text-[14.5px]">Tours, transfers and trip services with our own vans and drivers. Book in a minute, pay on the day.</p>
          <p className="m-0 text-[14.5px]">
            {copy.footer.wa} <span className="tnum select-all whitespace-nowrap font-bold text-ink">{formatWhatsapp()}</span>
          </p>
          {LEGAL.email ? (
            <a href={`mailto:${LEGAL.email}`} className="w-fit font-bold text-ink [overflow-wrap:anywhere]">
              {LEGAL.email}
            </a>
          ) : null}
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h} className="grid content-start gap-2">
            <h2 className="m-0 mb-1 text-[13px] font-extrabold uppercase tracking-[.06em] text-ink">{c.h}</h2>
            {c.links.map(([href, label]) => (
              <Link key={href} href={href} className="w-fit no-underline hover:text-ink hover:underline">
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="wrap mt-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-[13px]">
        <span>
          © {year} {legalName()}. All rights reserved.
          {LEGAL.licence ? <> · Tourist transport licence {LEGAL.licence}</> : null}
          {LEGAL.ice ? <> · ICE {LEGAL.ice}</> : null}
        </span>
        <Link href="/dispatch" className="no-underline hover:text-ink">
          {copy.footer.dispatch}
        </Link>
        </div>
      </div>
    </footer>
  );
}
