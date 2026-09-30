"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { waLink } from "@/lib/config";
import { fmtDate } from "@/lib/dates";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { Poster } from "./Poster";
import { ProductCard } from "./ProductCard";

const T = copy.trip;

export function MyTrip({ products }: { products: PublicProduct[] }) {
  const { trip, saved, money, ready } = useAppState();
  if (!ready) return <div className="min-h-[40vh]" />;

  const rows = [...trip].filter((m) => m.payment !== "paypal").sort((a, b) => a.date.localeCompare(b.date) || a.ref.localeCompare(b.ref));
  const due = (m: (typeof rows)[number]) => (m.payment === "paid" ? 0 : m.total);
  const sum = rows.reduce((s, m) => s + due(m), 0);
  const text =
    rows
      .map((m) => `${m.ref} · ${fmtDate(m.date)} · ${m.title}${m.mode === "private" ? ` (${copy.checkout.private})` : ""} · ${m.guests} · ${m.pickup} · ${m.payment === "paid" ? `${T.paid} ${money(m.total)}` : money(m.total)}`)
      .join("\n") + `\n${T.total}: ${money(sum)}`;
  const savedProducts = saved.map((id) => products.find((p) => p.id === id)).filter((p): p is PublicProduct => Boolean(p));

  return (
    <div className="mx-auto max-w-[820px] py-[26px]">
      <div className="mb-3.5 flex items-end justify-between gap-3">
        <h1 className="display m-0 text-[34px]">{T.h}</h1>
        <p className="m-0 text-sm text-muted">{T.p}</p>
      </div>

      {rows.length ? (
        <>
          <ul className="m-0 list-none p-0">
            {rows.map((m) => (
              <li key={m.ref} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line py-3 xs:grid-cols-[72px_minmax(0,1fr)]">
                <Poster scene={m.scene} image_url={m.image_url} uid={`t-${m.ref}`} className="rounded-xl" />
                <div className="min-w-0">
                  <Link href={`/done/${m.ref}`} className="block font-bold no-underline hover:underline">
                    {m.title}
                    {m.mode === "private" ? ` · ${copy.checkout.private}` : ""}
                  </Link>
                  <span className="text-sm text-muted">
                    {fmtDate(m.date)} · {m.guests} {copy.done.who.toLowerCase()} · {m.pickup}
                    {m.extras.length ? (
                      <>
                        <br />
                        {m.extras.join(", ")}
                      </>
                    ) : null}
                  </span>
                </div>
                <span className="tnum grid justify-items-end font-extrabold xs:col-start-2 xs:justify-items-start">
                  {money(m.total)}
                  {m.payment === "paid" ? <span className="text-xs font-bold text-ok">{T.paid}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3.5 rounded-card bg-soft p-4">
            <span>
              {T.total}
              <br />
              <b className="tnum text-[26px]">{money(sum)}</b>
            </span>
            <a className="min-h-[50px] rounded-full bg-wa px-[18px] py-3.5 text-center font-extrabold text-white no-underline" href={waLink(text)} target="_blank" rel="noopener">
              {T.wa}
            </a>
          </div>
        </>
      ) : (
        <div className="grid gap-3 rounded-card bg-soft p-7 text-center text-muted">
          <p className="m-0">{T.empty}</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/p/airport" className="min-h-[44px] rounded-full bg-blue px-4 py-2.5 font-extrabold text-blue-ink no-underline">
              {products.find((p) => p.id === "airport")?.title ?? copy.nav.book}
            </Link>
            <Link href="/concierge" className="min-h-[44px] rounded-full border border-line px-4 py-2.5 font-extrabold text-ink no-underline">
              {copy.nav.ask}
            </Link>
          </div>
        </div>
      )}

      {savedProducts.length ? (
        <section className="pt-8">
          <h2 className="display m-0 mb-4 text-[28px]">{T.saved}</h2>
          <div className="grid grid-cols-3 gap-x-[18px] gap-y-6 phone:grid-cols-2 phone:gap-x-3">
            {savedProducts.map((p) => (
              <ProductCard key={p.id} p={p} uid={`s-${p.id}`} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
