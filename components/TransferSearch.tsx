"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDate, today, tomorrow } from "@/lib/dates";
import { price } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { formatWhatsapp, waLink } from "@/lib/config";
import { useAppState } from "./AppState";

/** Places a transfer can start or end. `product` is the route to/from Marrakech that covers it. */
const PLACES: { id: string; label: string; product: string | null }[] = [
  { id: "mrk", label: "Marrakech (riad or hotel)", product: null },
  { id: "rak", label: "Marrakech airport (RAK)", product: "airport" },
  { id: "agafay", label: "Agafay desert", product: "to-agafay" },
  { id: "imlil", label: "Imlil", product: "to-imlil" },
  { id: "essaouira", label: "Essaouira", product: "to-essaouira" },
  { id: "ouarzazate", label: "Ouarzazate", product: "to-ouarzazate" },
  { id: "casa", label: "Casablanca", product: "to-casablanca" },
  { id: "cmn", label: "Casablanca airport (CMN)", product: "to-casablanca" },
  { id: "agadir", label: "Agadir or Taghazout", product: "to-agadir" },
  { id: "rabat", label: "Rabat", product: "to-rabat" },
  { id: "fes", label: "Fes", product: "to-fes" },
];
const place = (id: string) => PLACES.find((x) => x.id === id)!;

const field = "min-h-[50px] w-full min-w-0 rounded-input border border-line bg-bg px-3 font-semibold";
const label = "grid gap-1.5 text-[12.5px] font-bold uppercase tracking-[.08em] text-muted";

export function TransferSearch({ products }: { products: PublicProduct[] }) {
  const { money, prefs } = useAppState();
  const [from, setFrom] = useState("rak");
  const [to, setTo] = useState("mrk");
  const [ret, setRet] = useState(false);
  const [date, setDate] = useState(prefs.date || tomorrow());
  const [back, setBack] = useState("");
  const [guests, setGuests] = useState(2);

  const result = useMemo(() => {
    if (from === to) return { kind: "same" as const };
    const a = place(from);
    const b = place(to);
    // One end must be Marrakech itself; the other end picks the route.
    const route = from === "mrk" ? b.product : to === "mrk" ? a.product : null;
    const p = route ? products.find((x) => x.id === route) : undefined;
    if (!p) return { kind: "ask" as const, a, b };
    const hasRet = p.addons.some((x) => x.id === "ret");
    const r = price(p, { guests, mode: "shared", addonIds: ret && hasRet ? ["ret"] : [] });
    return { kind: "ok" as const, p, a, b, total: r.total, cars: r.cars, hasRet };
  }, [from, to, ret, guests, products]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const note =
    result.kind === "ok"
      ? [`From: ${result.a.label}`, `To: ${result.b.label}`, ret && back ? `Return: ${fmtDate(back)}` : ret ? "Return: date to confirm" : null]
          .filter(Boolean)
          .join(". ")
      : "";
  const bookHref =
    result.kind === "ok"
      ? `/book/${result.p.id}?date=${date}&guests=${guests}&mode=shared${ret && result.hasRet ? "&adds=ret" : ""}&note=${encodeURIComponent(note)}`
      : "";

  return (
    <section aria-labelledby="ts-h" className="mb-12 rounded-card border border-line bg-surface p-6 phone:p-4">
      <h2 id="ts-h" className="m-0 mb-5 text-xl font-extrabold">
        Where are you going?
      </h2>

      <div role="radiogroup" aria-label="Trip type" className="mb-4 inline-flex rounded-full bg-soft p-1">
        {[
          [false, "One way"],
          [true, "Return"],
        ].map(([v, l]) => (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={ret === v}
            onClick={() => setRet(v as boolean)}
            className={`min-h-[40px] rounded-full px-5 text-sm font-extrabold ${ret === v ? "bg-ink text-bg" : "text-muted"}`}
          >
            {l as string}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 tab:grid-cols-1">
        <label className={label}>
          From
          <select id="ts-from" value={from} onChange={(e) => setFrom(e.target.value)} className={field}>
            {PLACES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={swap} aria-label="Swap from and to" className="mb-1 grid h-11 w-11 place-items-center rounded-full border border-line hover:bg-soft tab:justify-self-center">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
          </svg>
        </button>
        <label className={label}>
          To
          <select id="ts-to" value={to} onChange={(e) => setTo(e.target.value)} className={field}>
            {PLACES.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={`mt-3 grid gap-3 ${ret ? "grid-cols-3" : "grid-cols-2"} phone:grid-cols-1`}>
        <label className={label}>
          Date
          <input type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </label>
        {ret ? (
          <label className={label}>
            Return date
            <input type="date" min={date || today()} value={back} onChange={(e) => setBack(e.target.value)} className={field} />
          </label>
        ) : null}
        <label className={label}>
          Passengers
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={field}>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        {result.kind === "ok" ? (
          <>
            <div>
              <b className="block text-[15px]">
                {result.a.label} → {result.b.label}
                {ret ? " and back" : ""}
              </b>
              <span className="text-sm text-muted">
                Private car{result.cars > 1 ? `s (${result.cars})` : ""}, door to door · {result.p.duration}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <b className="tnum text-2xl">{money(result.total)}</b>
              <Link href={bookHref} className="inline-flex min-h-[50px] items-center rounded-full bg-blue px-6 font-extrabold text-blue-ink no-underline">
                Book this transfer
              </Link>
            </div>
          </>
        ) : result.kind === "same" ? (
          <p className="m-0 text-sm text-muted">Choose two different places.</p>
        ) : (
          <>
            <p className="m-0 text-sm text-muted">
              {result.a.label} → {result.b.label}: we do this route too. Message us for a price.
            </p>
            <a
              href={waLink(`Hi Tariq, I need a transfer from ${result.a.label} to ${result.b.label}${ret ? ", return" : ""}, ${fmtDate(date)}, ${guests} passengers.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[50px] items-center rounded-full bg-wa px-6 font-extrabold text-white no-underline"
            >
              WhatsApp {formatWhatsapp()}
            </a>
          </>
        )}
      </div>
    </section>
  );
}
