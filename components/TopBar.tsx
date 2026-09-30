"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { formatWhatsapp, waLink } from "@/lib/config";
import { Logo } from "./Logo";
import { CURRENCIES, useAppState } from "./AppState";
import { askTariq, chatHidden } from "./ChatWidget";
import { useRouter } from "next/navigation";

const MENU: { href: string; label: string; sub: string }[] = [
  { href: "/c/trf", label: copy.nav.transfers, sub: "Airport, private driver, last day" },
  { href: "/c/exc", label: copy.nav.dayTrips, sub: "Ourika, Ouzoud, Essaouira, Imlil" },
  { href: "/c/des", label: copy.nav.desert, sub: "Sahara, Zagora, on to Fes, the Atlas" },
  { href: "/c/act", label: copy.nav.tours, sub: "Balloon, Agafay, quad, camels" },
  { href: "/c/svc", label: copy.nav.atRiad, sub: "Henna, chef, barber, photographer, kits & baby" },
];

const EXTRA: [string, string][] = [
  ["/plan", "Plan my trip"],
  ["/packages", "Packages"],
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
  const router = useRouter();

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

  const item = "rounded-[12px] px-3 py-2.5 text-[16px] font-bold text-ink no-underline hover:bg-soft";

  return (
    <>
      <header className="sticky z-30 border-b border-line bg-bg/90 backdrop-blur-md print:hidden" style={{ top: "env(safe-area-inset-top, 0px)" }}>
        <div className="wrap flex h-[62px] items-center gap-[18px] mid:gap-3">
          <Logo />

          <nav aria-label={copy.nav.main} className="flex min-w-0 flex-1 gap-0.5 mid:hidden">
            {MENU.map((m) => {
              const active = path.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={active ? "page" : undefined}
                  className={`whitespace-nowrap rounded-[10px] px-2 py-2 text-[14.5px] font-bold no-underline hover:bg-soft hover:text-ink ${active ? "bg-soft text-ink" : "text-muted"}`}
                >
                  {m.label}
                </Link>
              );
            })}
          </nav>

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
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-soft"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] print:hidden" role="dialog" aria-modal="true" aria-label="Menu" id="site-menu">
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-[rgb(10_8_28/.45)]" />
          <div
            className="absolute inset-y-0 right-0 flex w-[420px] flex-col overflow-y-auto bg-bg shadow-[-20px_0_60px_rgb(10_8_28/.2)] phone:w-full"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            <div className="flex h-[62px] flex-none items-center justify-between border-b border-line px-5">
              <span className="text-sm font-extrabold uppercase tracking-[.08em] text-muted">Menu</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" autoFocus className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label="Book" className="grid px-3 pt-3">
              {MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={path.startsWith(m.href) ? "page" : undefined}
                  className="grid gap-0.5 rounded-[14px] px-3 py-3 no-underline hover:bg-soft aria-[current=page]:bg-soft"
                >
                  <span className="text-[22px] font-extrabold leading-tight text-ink">{m.label}</span>
                  <span className="text-[13.5px] text-muted">{m.sub}</span>
                </Link>
              ))}
            </nav>

            <div className="mx-6 my-3 border-t border-line" />

            <nav aria-label="More" className="grid grid-cols-2 gap-x-2 px-3">
              {EXTRA.map(([href, label]) => (
                <Link key={href} href={href} className={item}>
                  {label}
                </Link>
              ))}
              <Link href="/trip" className={item}>
                {copy.nav.myTrip} {trip.length ? <span className="tnum text-muted">({trip.length})</span> : null}
              </Link>
              <Link href="/account" className={item}>
                Wishlist
              </Link>
            </nav>

            <div className="mt-auto grid gap-3 p-5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (chatHidden(path)) router.push("/concierge");
                  else askTariq();
                }}
                className="min-h-[50px] rounded-full bg-blue px-5 font-extrabold text-blue-ink"
              >
                Ask Tariq
              </button>
              <div className="flex items-center justify-between gap-3">
                <Currency big />
                <a href={waLink("Hi Tariq, ")} target="_blank" rel="noopener" className="text-sm font-bold text-ink no-underline">
                  WhatsApp <span className="tnum">{formatWhatsapp()}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
