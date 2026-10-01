"use client";

import { rules } from "@/lib/rules";
import { copy } from "@/lib/copy";
import { perLabel } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { useBookingSheet } from "./booking/BookingSheet";
import { Icon } from "./Icons";
import { PriceFrom } from "./ProductCard";

type P = Pick<PublicProduct, "id" | "price_eur" | "was_eur" | "per" | "addons" | "lead_days" | "prepay_only" | "refundable">;

/** Upsell priming: the add-on most travellers pick, shown before the booking sheet opens. */
function Popular({ p }: { p: P }) {
  const { money } = useAppState();
  const a = p.addons.find((x) => x.popular);
  if (!a) return null;
  return (
    <p className="m-0 rounded-input bg-soft px-3 py-2.5 text-[13.5px] leading-snug">
      <span className="font-extrabold">{copy.product.mostAdd}</span> {a.label}, {a.eur ? <><span className="tnum font-bold">+{money(a.eur)}</span> {perLabel(a.per)}</> : <b>free</b>}
    </p>
  );
}

function useCheck() {
  return useBookingSheet().open;
}

/** Desktop: sticky right column. */
export function BookingBox({ p }: { p: P }) {
  const check = useCheck();
  return (
    <aside className="sticky top-[86px] grid gap-3.5 rounded-card border border-line bg-surface p-5 shadow-[0_8px_30px_rgb(0_0_0/.06)]">
      <PriceFrom p={p} size="lg" />
      <Popular p={p} />
      <button type="button" onClick={check} className="min-h-[48px] rounded-full bg-blue px-[18px] text-base font-extrabold text-blue-ink">
        {copy.product.check}
      </button>
      <ul className="m-0 grid list-none gap-2.5 border-t border-line p-0 pt-3.5 text-[13.5px]">
        <li className="grid grid-cols-[20px_minmax(0,1fr)] gap-2">
          <span className="text-ok"><Icon name="shield" size={20} /></span>
          <span><b className="block">{rules(p).cancelH}</b><span className="text-muted">{rules(p).cancelP}</span></span>
        </li>
        <li className="grid grid-cols-[20px_minmax(0,1fr)] gap-2">
          <span className="text-ok"><Icon name="wallet" size={20} /></span>
          <span><b className="block">{rules(p).payH}</b><span className="text-muted">{rules(p).leadNote ? `${rules(p).leadNote}. ` : ""}{rules(p).payP}</span></span>
        </li>
        <li className="grid grid-cols-[20px_minmax(0,1fr)] gap-2">
          <span className="text-ok"><Icon name="check" size={20} /></span>
          <span><b className="block">Instant confirmation</b><span className="text-muted">Your reference straight away. Show it on your phone, no printing. No hidden fees.</span></span>
        </li>
      </ul>
    </aside>
  );
}

/** Phone: sticky bar that sits directly above the bottom tab bar. */
export function MobileBookBar({ p }: { p: P }) {
  const check = useCheck();
  const { money } = useAppState();
  return (
    <div
      className="fixed inset-x-0 z-[34] hidden items-center justify-between gap-3 border-t border-line bg-surface px-4 py-2.5 shadow-[0_-6px_20px_rgb(0_0_0/.06)] phone:flex"
      style={{ bottom: "calc(var(--tabh) + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="text-sm leading-tight">
        <span className="text-muted">{copy.price.from} </span>
        <b className="tnum text-lg">{p.price_eur ? money(p.price_eur) : "Free"}</b>
        <span className="block text-xs text-muted">{perLabel(p.per)}</span>
      </span>
      <button type="button" onClick={check} className="min-h-[46px] rounded-full bg-blue px-5 font-extrabold text-blue-ink">
        {copy.product.check}
      </button>
    </div>
  );
}
