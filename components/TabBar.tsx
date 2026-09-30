"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";
import { useAppState } from "./AppState";

const icon = {
  explore: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  book: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  tariq: (
    <>
      <path d="M5 18l-1 3 4-2h9a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 001 3z" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" />
    </>
  ),
  trip: (
    <>
      <path d="M4 8h16v11a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </>
  ),
};

const TABS = [
  { href: "/", label: copy.nav.explore, icon: icon.explore, match: (p: string) => p === "/" },
  { href: "/#book", label: copy.nav.book, icon: icon.book, match: (p: string) => p.startsWith("/c/") || p.startsWith("/p/") || p.startsWith("/book/") },
  { href: "/concierge", label: copy.nav.tariq, icon: icon.tariq, match: (p: string) => p.startsWith("/concierge") },
  { href: "/trip", label: copy.nav.myTrip, icon: icon.trip, match: (p: string) => p.startsWith("/trip") || p.startsWith("/done/"), count: true },
];

/** Phone-only bottom tab bar (≤ 760px). Height is --tabh plus the safe-area inset. */
export function TabBar() {
  const path = usePathname();
  const { trip } = useAppState();

  return (
    <nav
      aria-label={copy.nav.tabs}
      className="fixed inset-x-0 bottom-0 z-[35] hidden grid-cols-4 border-t border-line bg-bg/95 px-1.5 pt-1.5 backdrop-blur-md phone:grid"
      style={{ paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))" }}
    >
      {TABS.map((t) => {
        const active = t.match(path);
        return (
          <Link
            key={t.label}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`relative grid min-h-[48px] justify-items-center gap-0.5 py-1 text-[11px] font-bold no-underline ${
              active ? "text-blue" : "text-muted"
            }`}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {t.icon}
            </svg>
            <span>{t.label}</span>
            {t.count ? (
              <span className="tnum absolute right-[calc(50%-22px)] top-0 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-sun px-1 text-[10.5px] text-sun-ink">
                {trip.length}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
