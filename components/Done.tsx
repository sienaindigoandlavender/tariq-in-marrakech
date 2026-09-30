"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { copy } from "@/lib/copy";
import { waLink } from "@/lib/config";
import { fmtDate } from "@/lib/dates";
import { bookingSummary } from "@/lib/summary";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";

const D = copy.done;

export function Done({ refCode, xsell }: { refCode: string; xsell: Pick<PublicProduct, "id" | "title" | "price_eur" | "per">[] }) {
  const { trip, money, ready, updateTrip } = useAppState();
  const paidParam = useSearchParams().get("payment") === "paid";
  useEffect(() => {
    if (ready && paidParam) {
      updateTrip(refCode, { payment: "paid" });
      try {
        sessionStorage.removeItem("tq_draft");
      } catch {}
    }
  }, [ready, paidParam, refCode, updateTrip]);
  if (!ready) return <div className="min-h-[50vh]" />;
  const found = trip.find((t) => t.ref === refCode);
  const b = found && paidParam ? { ...found, payment: "paid" as const } : found;

  if (!b) {
    return (
      <div className="mx-auto grid max-w-[640px] gap-4 py-10">
        <h1 className="display m-0 text-[34px]">{refCode}</h1>
        <p className="m-0 text-muted">{D.missing}</p>
        <a className="min-h-[50px] rounded-full bg-wa px-[18px] py-3.5 text-center font-extrabold text-white no-underline" href={waLink(`${D.ref}: ${refCode}`)} target="_blank" rel="noopener">
          {D.sendWa}
        </a>
      </div>
    );
  }

  const paid = b.payment === "paid";
  const awaiting = b.payment === "paypal";
  const summary = bookingSummary({ ...b, totalText: paid ? `${money(0)} (${D.paidOnline} ${money(b.total)})` : money(b.total) });
  const picks = xsell.filter((x) => x.id !== b.id && !trip.some((t) => t.id === x.id)).slice(0, 2);

  return (
    <div className="mx-auto grid max-w-[640px] gap-5 py-8">
      <div>
        <h1 className="m-0 mb-1 text-[26px] font-extrabold">{D.h}</h1>
        <p className="m-0 text-[14.5px] text-muted">{D.p}</p>
      </div>

      <div className="grid gap-2 rounded-card border-2 border-dashed border-blue p-4">
        <span className="text-[12.5px] text-muted">{D.ref}</span>
        <span className="display text-[34px] tracking-[.06em]">{b.ref}</span>
        <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 gap-y-1 text-[14.5px]">
          <dt className="text-muted">{D.booking}</dt>
          <dd className="m-0 font-bold">
            {b.title}
            {b.mode === "private" ? ` · ${copy.checkout.private}` : ""}
          </dd>
          <dt className="text-muted">{D.when}</dt>
          <dd className="m-0 font-bold">{fmtDate(b.date)}</dd>
          <dt className="text-muted">{D.who}</dt>
          <dd className="m-0 font-bold">{b.guests}</dd>
          {b.extras.length ? (
            <>
              <dt className="text-muted">{D.with}</dt>
              <dd className="m-0 break-words font-bold">{b.extras.join(", ")}</dd>
            </>
          ) : null}
          <dt className="text-muted">{D.where}</dt>
          <dd className="m-0 break-words font-bold">{b.pickup}</dd>
          {paid ? (
            <>
              <dt className="text-muted">{D.paidOnline}</dt>
              <dd className="tnum m-0 font-bold text-ok">{money(b.total)}</dd>
              <dt className="text-muted">{D.pay}</dt>
              <dd className="tnum m-0 font-bold">{money(0)}</dd>
            </>
          ) : (
            <>
              <dt className="text-muted">{D.pay}</dt>
              <dd className="tnum m-0 font-bold">{money(b.total)}</dd>
            </>
          )}
        </dl>
      </div>

      {paid ? <p className="m-0 rounded-input bg-ok/15 p-3 text-sm font-bold text-ok">{D.paidOnline} · {D.nothingDue}</p> : null}
      {awaiting ? <p className="m-0 rounded-input bg-sun/20 p-3 text-sm font-bold">{D.payPending}</p> : null}
      {!b.persisted ? <p className="m-0 rounded-input bg-sun/20 p-3 text-sm font-bold">{D.notStored}</p> : null}

      {picks.length ? (
        <div className="grid gap-2.5 rounded-card bg-soft p-3.5">
          <h2 className="m-0 text-base font-extrabold">{D.xsell}</h2>
          {picks.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-2.5 text-[14.5px]">
              <span>
                {x.title} · <span className="tnum">{copy.price.from} {money(x.price_eur)}</span>
              </span>
              <Link href={`/book/${x.id}?date=${b.date}&guests=${b.guests}`} className="grid min-h-[40px] place-items-center whitespace-nowrap rounded-full bg-blue px-4 text-[13px] font-extrabold text-blue-ink no-underline">
                {D.add}
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        <a className="min-h-[50px] flex-[1_1_180px] rounded-full bg-wa px-[18px] py-3.5 text-center font-extrabold text-white no-underline" href={waLink(summary)} target="_blank" rel="noopener">
          {D.sendWa}
        </a>
        <Link href="/trip" className="min-h-[50px] flex-[1_1_180px] rounded-full border border-line px-[18px] py-3.5 text-center font-extrabold no-underline">
          {D.seeTrip}
        </Link>
      </div>
    </div>
  );
}
