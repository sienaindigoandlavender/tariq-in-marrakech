"use client";

import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { perLabel } from "@/lib/format";
import { price } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { DateGuests } from "./Listing";
import { Assurances, PriceFrom } from "./ProductCard";

type P = Pick<PublicProduct, "id" | "price_eur" | "was_eur" | "per" | "cap" | "private_per_car" | "addons">;

/** Total for the chosen guests (no extras) and the add-on most travellers pick. */
function useQuote(p: P) {
  const { prefs, ready } = useAppState();
  const guests = ready ? prefs.guests : 2;
  const q = price(p, { guests, mode: "shared", addonIds: [] });
  const popular = p.addons.find((a) => a.popular) ?? null;
  return { guests, total: q.total, cars: q.cars, popular };
}

function guestLine(n: number) {
  return `${copy.product.totalFor} ${n} ${n === 1 ? copy.product.guest : copy.product.guests}`;
}

function Popular({ a }: { a: P["addons"][number] }) {
  const { money } = useAppState();
  return (
    <p className="m-0 rounded-input bg-soft px-3 py-2.5 text-[13.5px] leading-snug">
      <span className="font-extrabold">{copy.product.mostAdd}</span> {a.label}, <span className="tnum font-bold">+{money(a.eur)}</span> {perLabel(a.per)}
    </p>
  );
}

function useCheck(id: string) {
  const router = useRouter();
  const { prefs } = useAppState();
  return () => router.push(`/book/${id}?date=${prefs.date}&guests=${prefs.guests}`);
}

/** Desktop: sticky right column. */
export function BookingBox({ p }: { p: P }) {
  const check = useCheck(p.id);
  const { money } = useAppState();
  const q = useQuote(p);
  return (
    <aside className="sticky top-[86px] grid gap-3.5 rounded-card border border-line bg-surface p-5 shadow-[0_8px_30px_rgb(0_0_0/.06)]">
      <PriceFrom p={p} size="lg" />
      <div className="grid grid-cols-2 gap-3">
        <DateGuests compact />
      </div>
      <p className="m-0 flex items-baseline justify-between gap-2 border-t border-line pt-3 text-sm text-muted" aria-live="polite">
        <span>{guestLine(q.guests)}{p.per === "car" && q.cars > 1 ? ` · ${q.cars} ${copy.product.cars}` : ""}</span>
        <b className="tnum text-lg text-ink">{money(q.total)}</b>
      </p>
      {q.popular ? <Popular a={q.popular} /> : null}
      <button type="button" onClick={check} className="min-h-[48px] rounded-full bg-blue px-[18px] text-base font-extrabold text-blue-ink">
        {copy.product.check}
      </button>
      <Assurances />
    </aside>
  );
}

/** Phone: sticky bar that sits directly above the bottom tab bar. */
export function MobileBookBar({ p }: { p: P }) {
  const check = useCheck(p.id);
  const { money } = useAppState();
  const q = useQuote(p);
  return (
    <div
      className="fixed inset-x-0 z-[34] hidden items-center justify-between gap-3 border-t border-line bg-surface px-4 py-2.5 shadow-[0_-6px_20px_rgb(0_0_0/.06)] phone:flex"
      style={{ bottom: "calc(var(--tabh) + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="min-w-0 text-sm leading-tight">
        <b className="tnum text-lg">{money(q.total)}</b>
        <span className="block whitespace-nowrap text-xs text-muted">{q.guests} {q.guests === 1 ? copy.product.guest : copy.product.guests} · {copy.product.payDay}</span>
      </span>
      <button type="button" onClick={check} className="min-h-[46px] flex-none whitespace-nowrap rounded-full bg-blue px-5 font-extrabold text-blue-ink xs:px-4">
        {copy.product.check}
      </button>
    </div>
  );
}
