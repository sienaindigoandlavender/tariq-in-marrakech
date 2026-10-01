"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { waLink } from "@/lib/config";
import { Logo } from "./Logo";
import { CURRENCIES, useAppState } from "./AppState";

const MENU: { href: string; label: string; sub: string }[] = [
  { href: "/c/trf", label: copy.nav.transfers, sub: "Airport, Essaouira, Casablanca, Agafay, driver" },
  { href: "/c/exc", label: copy.nav.dayTrips, sub: "Ourika, Ouzoud, Essaouira, Imlil" },
  { href: "/c/des", label: copy.nav.desert, sub: "Sahara, Zagora, on to Fes, the Atlas" },
  { href: "/c/act", label: copy.nav.tours, sub: "Balloon, Agafay, quad, camels" },
  { href: "/c/tkt", label: copy.nav.tickets, sub: "Bacha Coffee, Bahia Palace, Saadian Tombs" },
  { href: "/c/svc", label: copy.nav.atRiad, sub: "Restaurant tables, henna, chef, barber, kits & baby" },
];

const EXTRA: [string, string][] = [
  ["/plan", "Plan my trip"],
  ["/packages", "Packages"],
  ["/c/gft", "Gift vouchers"],
  ["/faq", "FAQ"],
  ["/contact", "Contact"],
];

function Currency({ big = false }: { big?: boolean }) {
  const { currency, setCurrency } = useAppState();
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{copy.nav.currency}</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as (typeof CURRENCIES)[number])}
        className={`appearance-none rounded-[10px] bg-soft py-1.5 pl-3 pr-7 font-extrabold text-ink ${big ? "min-h-[46px] text-[15px]" : "min-h-[40px] text-[13px]"}`}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c === "EUR" ? "€ EUR" : c === "USD" ? "US$ USD" : c === "GBP" ? "£ GBP" : "MAD"}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}

export function TopBar() {
  const path = usePathname();
  const { trip, saved, user } = useAppState();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);

  const link = "py-1.5 text-[15px] font-bold uppercase tracking-[.16em] no-underline hover:text-blue aria-[current=page]:text-blue";

  return (
    <>
      <header className="sticky z-[47] border-b border-line bg-bg/90 backdrop-blur-md print:hidden" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="wrap flex h-[62px] items-center gap-[18px] mid:gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            className="-ml-2 grid h-11 w-11 flex-none place-items-center rounded-full text-ink hover:bg-soft"
          >
            <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M18 6L8 14l10 8" /> : <path d="M4 10h20M4 17h12" />}
            </svg>
          </button>
          <Logo />


          <div className="ml-auto flex flex-none items-center gap-2 phone:gap-1">
            <span className="phone:hidden">
              <Currency />
            </span>
            <Link
              href="/account"
              aria-label={`Wishlist${saved.length ? `, ${saved.length} saved` : ""}${user ? "" : ". Sign in or create an account"}`}
              title={user ? "Wishlist" : "Wishlist and account"}
              aria-current={path.startsWith("/account") ? "page" : undefined}
              className={`relative grid h-10 w-10 flex-none place-items-center rounded-full no-underline hover:bg-soft ${path.startsWith("/account") ? "bg-soft" : ""}`}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill={saved.length ? "rgb(var(--rose))" : "none"} stroke={saved.length ? "rgb(var(--rose))" : "currentColor"} strokeWidth="2" strokeLinejoin="round" className="text-ink">
                <path d="M12 20s-7-4.4-9.2-9A5 5 0 0112 5.6 5 5 0 0121.2 11C19 15.6 12 20 12 20z" />
              </svg>
              {saved.length ? (
                <span className="tnum absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10.5px] font-extrabold text-bg">{saved.length}</span>
              ) : null}
              {user ? <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-ok ring-2 ring-bg" aria-hidden="true" /> : null}
            </Link>
            <Link href="/trip" className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-blue px-3.5 text-sm font-extrabold text-blue-ink no-underline phone:hidden">
              {copy.nav.myTrip}
              <span className="tnum inline-grid h-5 min-w-5 place-items-center rounded-full bg-sun px-[5px] text-xs text-sun-ink">{trip.length}</span>
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-[46] print:hidden" style={{ top: "calc(62px + env(safe-area-inset-top, 0px))" }} id="site-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-[rgb(10_8_28/.35)] phone:hidden" />
          <div className="absolute inset-y-0 left-0 flex w-[380px] flex-col overflow-y-auto bg-soft phone:w-full" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <nav aria-label="Book" className="grid gap-1 px-[50px] pt-12 xs:px-10">
              {MENU.map((m) => (
                <Link key={m.href} href={m.href} aria-current={path.startsWith(m.href) ? "page" : undefined} className={`${link} text-ink`}>
                  {m.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="More" className="grid gap-1 px-[50px] pt-9 xs:px-10">
              {EXTRA.map(([href, label]) => (
                <Link key={href} href={href} className={`${link} text-muted`}>
                  {label}
                </Link>
              ))}
              <Link href="/trip" className={`${link} text-muted`}>
                {copy.nav.myTrip}
                {trip.length ? ` (${trip.length})` : ""}
              </Link>
              <Link href="/account" className={`${link} text-muted`}>
                Wishlist
              </Link>
            </nav>
            <div className="mt-auto flex items-center justify-between gap-3 px-[50px] py-8 xs:px-10">
              <Currency />
              <a href={waLink("Hi Tariq, ")} target="_blank" rel="noopener" className="text-[13px] font-bold tracking-[.06em] text-muted no-underline">
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
