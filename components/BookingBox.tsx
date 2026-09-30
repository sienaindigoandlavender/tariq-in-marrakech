"use client";

import { useRouter } from "next/navigation";
import { copy } from "@/lib/copy";
import { perLabel } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { DateGuests } from "./Listing";
import { Assurances, PriceFrom } from "./ProductCard";

type P = Pick<PublicProduct, "id" | "price_eur" | "was_eur" | "per">;

function useCheck(id: string) {
  const router = useRouter();
  const { prefs } = useAppState();
  return () => router.push(`/book/${id}?date=${prefs.date}&guests=${prefs.guests}`);
}

/** Desktop: sticky right column. */
export function BookingBox({ p }: { p: P }) {
  const check = useCheck(p.id);
  return (
    <aside className="sticky top-[86px] grid gap-3.5 rounded-card border border-line bg-surface p-5 shadow-[0_8px_30px_rgb(0_0_0/.06)]">
      <PriceFrom p={p} size="lg" />
      <div className="grid grid-cols-2 gap-3">
        <DateGuests compact />
      </div>
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
  return (
    <div
      className="fixed inset-x-0 z-[34] hidden items-center justify-between gap-3 border-t border-line bg-surface px-4 py-2.5 shadow-[0_-6px_20px_rgb(0_0_0/.06)] phone:flex"
      style={{ bottom: "calc(var(--tabh) + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="text-sm leading-tight">
        <span className="text-muted">{copy.price.from} </span>
        <b className="tnum text-lg">{money(p.price_eur)}</b>
        <span className="block text-xs text-muted">{perLabel(p.per)}</span>
      </span>
      <button type="button" onClick={check} className="min-h-[46px] rounded-full bg-blue px-5 font-extrabold text-blue-ink">
        {copy.product.check}
      </button>
    </div>
  );
}
