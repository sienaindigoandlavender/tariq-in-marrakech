"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { offPct, perLabel } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { Poster, distLabel } from "./Poster";

type CardProduct = Pick<
  PublicProduct,
  "id" | "title" | "subtitle" | "blurb" | "duration" | "price_eur" | "was_eur" | "per" | "badge" | "scene" | "image_url" | "km" | "drive_time"
>;

export function Heart({ id, className = "" }: { id: string; className?: string }) {
  const { saved, toggleSaved } = useAppState();
  const on = saved.includes(id);
  return (
    <button
      type="button"
      onClick={() => toggleSaved(id)}
      aria-pressed={on}
      aria-label={on ? copy.listing.unsave : copy.listing.save}
      className={`grid h-11 w-11 place-items-center rounded-full ${className}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={on ? "rgb(var(--rose))" : "none"} stroke={on ? "rgb(var(--rose))" : "#16162a"} strokeWidth="2" strokeLinejoin="round">
          <path d="M12 20s-7-4.4-9.2-9A5 5 0 0112 5.6 5 5 0 0121.2 11C19 15.6 12 20 12 20z" />
        </svg>
      </span>
    </button>
  );
}

export function PriceFrom({ p, size = "md" }: { p: Pick<CardProduct, "price_eur" | "was_eur" | "per">; size?: "md" | "lg" }) {
  const { money } = useAppState();
  const off = offPct(p.price_eur, p.was_eur);
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      {off ? (
        <>
          <span className="tnum text-[13px] text-muted line-through">{money(p.was_eur!)}</span>
          <span className="rounded-md bg-rose px-1.5 py-px text-[11.5px] font-extrabold text-white">−{off}%</span>
        </>
      ) : null}
      <span className="text-[12.5px] font-semibold text-muted">{copy.price.from}</span>
      <span className={`tnum font-extrabold ${size === "lg" ? "text-2xl" : "text-lg"}`}>{money(p.price_eur)}</span>
      <span className="text-[12.5px] font-semibold text-muted">{perLabel(p.per)}</span>
    </div>
  );
}

export function Assurances({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-0.5 text-[13px] font-bold text-ok ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <Check /> {copy.listing.freeCancel}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Check /> {copy.listing.payOnArrival}
      </span>
    </div>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ProductCard({ p, uid }: { p: CardProduct; uid?: string }) {
  const href = `/p/${p.id}`;
  return (
    <article className="group flex min-w-0 flex-col gap-2.5">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <Poster scene={p.scene} image_url={p.image_url} alt={p.title} uid={uid ?? `c-${p.id}`} tag={p.subtitle} badge={p.badge} dist={distLabel(p)} hover />
        </Link>
        <Heart id={p.id} className="absolute bottom-0.5 left-0.5" />
      </div>
      <Link href={href} className="grid gap-1.5 no-underline">
        <h3 className="m-0 text-[16.5px] font-extrabold leading-tight group-hover:underline">{p.title}</h3>
        <p className="m-0 line-clamp-2 text-sm text-muted">{p.blurb}</p>
        <span className="text-[13px] font-semibold text-muted">{p.duration}</span>
        <Assurances />
        <PriceFrom p={p} />
      </Link>
    </article>
  );
}
