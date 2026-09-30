"use client";

import Link from "next/link";
import type { PackageView } from "@/lib/packages";
import { useAppState } from "./AppState";
import { PosterScene } from "./PosterScene";

/** A ready-made trip: the items it bundles, an honest "from" price, and a link into Plan my trip. */
export function PackageCard({ p, compact = false }: { p: PackageView; compact?: boolean }) {
  const { money } = useAppState();
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface">
      <Link href={`/plan?package=${p.id}`} tabIndex={-1} aria-hidden="true" className="relative block aspect-[16/9] overflow-hidden">
        <PosterScene scene={p.scene} uid={`pk-${p.id}${compact ? "-c" : ""}`} className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none" />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-[9px] py-1 text-[11.5px] font-extrabold text-[#16162a]">{p.days}</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="m-0 text-lg font-extrabold leading-tight">
          <Link href={`/plan?package=${p.id}`} className="no-underline hover:underline">
            {p.title}
          </Link>
        </h3>
        <p className="m-0 text-[14.5px] text-muted">{p.blurb}</p>
        {!compact ? (
          <ul className="m-0 grid list-none gap-1 p-0 text-sm">
            {p.products.map((x) => (
              <li key={x.id} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-sun" />
                <Link href={`/p/${x.id}`} className="no-underline hover:underline">
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 text-[13px] font-semibold text-muted">{p.products.map((x) => x.title).join(" · ")}</p>
        )}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <span className="leading-tight">
            <span className="text-[12.5px] font-semibold text-muted">from </span>
            <b className="tnum text-xl">{money(p.fromPp)}</b>
            <span className="text-[12.5px] font-semibold text-muted"> per person</span>
            <span className="block text-xs text-muted">for 2 travellers, before extras</span>
          </span>
          <Link href={`/plan?package=${p.id}`} className="inline-flex min-h-[44px] items-center rounded-full bg-blue px-4 text-sm font-extrabold text-blue-ink no-underline">
            Plan this trip
          </Link>
        </div>
      </div>
    </article>
  );
}
