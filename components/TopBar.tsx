"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";
import { Logo } from "./Logo";
import { CURRENCIES, useAppState } from "./AppState";

const MENU: { href: string; label: string; short?: string }[] = [
  { href: "/c/exc", label: copy.nav.dayTrips },
  { href: "/c/des", label: copy.nav.desert },
  { href: "/c/trf", label: copy.nav.transfers },
  { href: "/c/svc", label: copy.nav.atRiad },
  { href: "/c/kit", label: copy.nav.kits, short: "Kits" },
  { href: "/packages", label: copy.nav.packages },
];

export function TopBar() {
  const path = usePathname();
  const { currency, setCurrency, trip, saved, user } = useAppState();

  return (
    <header
      className="sticky z-30 border-b border-line bg-bg/90 backdrop-blur-md print:hidden"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="wrap flex h-[62px] items-center gap-[18px] mid:gap-3">
        <Logo />

        <nav aria-label={copy.nav.main} className="no-scrollbar flex min-w-0 flex-1 gap-0.5 overflow-x-auto tab:gap-0 phone:hidden">
          {MENU.map((m) => {
            const active = m.href === "/" ? path === "/" : path.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-[10px] px-2 py-2 text-[14.5px] font-bold mid:px-1.5 mid:text-[14px] tab:px-1 tab:text-[13.5px] no-underline hover:bg-soft hover:text-ink ${
                  active ? "bg-soft text-ink" : "text-muted"
                }`}
              >
                {m.short ? (
                  <>
                    <span className="mid:hidden">{m.label}</span>
                    <span className="hidden mid:inline" aria-hidden="true">{m.short}</span>
                  </>
                ) : (
                  m.label
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2.5 tab:gap-2">
          <label className="relative inline-flex">
            <span className="sr-only">{copy.nav.currency}</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as (typeof CURRENCIES)[number])}
              className="min-h-[40px] appearance-none rounded-[10px] bg-soft py-1.5 pl-3 pr-7 text-[13px] font-extrabold text-ink"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c === "EUR" ? "€ EUR" : c === "USD" ? "$ USD" : c === "GBP" ? "£ GBP" : "MAD"}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
          </label>
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
          <Link
            href="/plan"
            className="inline-flex min-h-[40px] items-center rounded-full border border-ink px-3.5 text-sm font-extrabold text-ink no-underline hover:bg-soft mid:hidden"
          >
            {copy.nav.plan}
          </Link>
          <Link
            href="/trip"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-full bg-blue px-3.5 text-sm font-extrabold text-blue-ink no-underline phone:hidden"
          >
            {copy.nav.myTrip}
            <span className="tnum inline-grid h-5 min-w-5 place-items-center rounded-full bg-sun px-[5px] text-xs text-sun-ink">
              {trip.length}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
