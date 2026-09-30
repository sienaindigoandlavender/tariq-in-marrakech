"use client";

import { useMemo, useState } from "react";
import { copy } from "@/lib/copy";
import { tomorrow } from "@/lib/dates";
import type { Category, PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { ProductCard } from "./ProductCard";

type Sort = "rec" | "low" | "high";
const CHIPS: ("all" | Category)[] = ["all", "exc", "des", "act", "trf", "svc", "kit"];

export function DateGuests({ compact = false }: { compact?: boolean }) {
  const { prefs, setPrefs, ready } = useAppState();
  const min = tomorrow();
  return (
    <>
      <label className="grid gap-1 text-[13px] font-bold">
        {copy.listing.date}
        <input
          type="date"
          min={min}
          value={ready ? prefs.date : ""}
          onChange={(e) => e.target.value && setPrefs({ date: e.target.value < min ? min : e.target.value })}
          className={`min-h-[44px] rounded-input border border-line bg-bg px-3 font-medium ${compact ? "w-full" : ""}`}
        />
      </label>
      <div className="grid gap-1 text-[13px] font-bold">
        <span id="guests-label">{copy.listing.guests}</span>
        <div role="group" aria-labelledby="guests-label" className="flex min-h-[44px] items-center rounded-input border border-line bg-bg">
          <button type="button" aria-label={copy.listing.fewer} disabled={prefs.guests <= 1} onClick={() => setPrefs({ guests: prefs.guests - 1 })} className="h-11 w-11 text-lg font-extrabold disabled:opacity-40">
            −
          </button>
          <output aria-live="polite" className="tnum min-w-[2ch] flex-1 text-center text-base">
            {prefs.guests}
          </output>
          <button type="button" aria-label={copy.listing.more} disabled={prefs.guests >= 14} onClick={() => setPrefs({ guests: prefs.guests + 1 })} className="h-11 w-11 text-lg font-extrabold disabled:opacity-40">
            +
          </button>
        </div>
      </div>
    </>
  );
}

export function Listing({ products, initial = "all" }: { products: PublicProduct[]; initial?: "all" | Category }) {
  const [cat, setCat] = useState<"all" | Category>(initial);
  const [sort, setSort] = useState<Sort>("rec");

  const list = useMemo(() => {
    const l = products.filter((p) => cat === "all" || p.category === cat);
    if (sort === "low") return [...l].sort((a, b) => a.price_eur - b.price_eur);
    if (sort === "high") return [...l].sort((a, b) => b.price_eur - a.price_eur);
    return l; // server already sent them in Recommended order
  }, [products, cat, sort]);

  return (
    <>
      <div className="mb-4 grid grid-cols-2 items-end gap-3 rounded-card bg-soft p-3 sm:flex sm:flex-wrap">
        <DateGuests />
        <label className="grid gap-1 text-[13px] font-bold">
          {copy.listing.sort}
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-[44px] rounded-input border border-line bg-bg px-3 font-medium">
            <option value="rec">{copy.listing.sortRecommended}</option>
            <option value="low">{copy.listing.sortLow}</option>
            <option value="high">{copy.listing.sortHigh}</option>
          </select>
        </label>
        <p className="m-0 self-center text-sm font-bold text-muted sm:ml-auto" aria-live="polite">
          {copy.listing.results(list.length)}
        </p>
      </div>

      <div role="group" aria-label="Categories" className="no-scrollbar mb-[18px] flex gap-2 overflow-x-auto pb-0.5">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === cat}
            onClick={() => setCat(c)}
            className={`min-h-[40px] flex-none rounded-full border px-3.5 text-sm font-bold ${
              c === cat ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted"
            }`}
          >
            {copy.categories[c]}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="grid grid-cols-4 gap-x-[18px] gap-y-6 tab:grid-cols-3 phone:grid-cols-2 phone:gap-x-3 phone:gap-y-[18px]">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <p className="rounded-card bg-soft p-7 text-center text-muted">{copy.listing.empty}</p>
      )}
    </>
  );
}
