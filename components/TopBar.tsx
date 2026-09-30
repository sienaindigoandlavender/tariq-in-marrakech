"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";
import { Logo } from "./Logo";
import { useAppState, type Currency } from "./AppState";

const MENU = [
  { href: "/", label: copy.nav.explore },
  { href: "/c/exc", label: copy.nav.dayTrips },
  { href: "/c/des", label: copy.nav.desert },
  { href: "/c/trf", label: copy.nav.transfers },
  { href: "/c/svc", label: copy.nav.atRiad },
  { href: "/c/kit", label: copy.nav.kits },
  { href: "/concierge", label: copy.nav.ask },
];

export function TopBar() {
  const path = usePathname();
  const { currency, setCurrency, trip } = useAppState();

  return (
    <header
      className="sticky z-30 border-b border-line bg-bg/90 backdrop-blur-md print:hidden"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="wrap flex h-[62px] items-center gap-[18px]">
        <Logo />

        <nav aria-label={copy.nav.main} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto phone:hidden">
          {MENU.map((m) => {
            const active = m.href === "/" ? path === "/" : path.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-[10px] px-[11px] py-2 text-[14.5px] font-bold no-underline hover:bg-soft hover:text-ink ${
                  active ? "bg-soft text-ink" : "text-muted"
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2.5">
          <div role="group" aria-label={copy.nav.currency} className="inline-flex rounded-[10px] bg-soft p-[3px]">
            {(["EUR", "MAD"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={currency === c}
                onClick={() => setCurrency(c)}
                className={`min-h-[36px] min-w-[40px] rounded-[7px] px-2 text-[12.5px] font-extrabold ${
                  currency === c ? "bg-surface text-ink shadow-sm" : "text-muted"
                }`}
              >
                {c === "EUR" ? "€" : "MAD"}
              </button>
            ))}
          </div>
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
