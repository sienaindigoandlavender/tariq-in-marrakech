"use client";

import { useState } from "react";
import { copy } from "@/lib/copy";
import { fmtDate, tomorrow } from "@/lib/dates";
import { perLabel } from "@/lib/format";
import { price } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "../AppState";
import { Icon } from "../Icons";
import { Calendar } from "./Calendar";

const C = copy.checkout;
export type Selection = { date: string; guests: number; mode: "shared" | "private"; adds: string[] };

export const maxGuests = (p: Pick<PublicProduct, "per">) => (p.per === "car" ? 9 : 14);

/** Date + participants pills, then option cards; the chosen option opens its extras. */
export function OptionsPanel({ p, sel, onChange }: { p: PublicProduct; sel: Selection; onChange: (s: Selection) => void }) {
  const { money } = useAppState();
  const [open, setOpen] = useState<"date" | "guests" | null>(null);
  const set = (patch: Partial<Selection>) => onChange({ ...sel, ...patch });
  const maxG = maxGuests(p);
  const total = (mode: Selection["mode"]) => price(p, { guests: sel.guests, mode, addonIds: sel.adds }).total;

  const modes: { m: Selection["mode"]; title: string; sub: string }[] = [
    { m: "shared", title: p.private_per_car ? C.shared : C.standard, sub: p.private_per_car ? C.sharedS : p.blurb },
    ...(p.private_per_car ? [{ m: "private" as const, title: C.private, sub: C.privateS }] : []),
  ];

  const pill = (k: "date" | "guests", icon: "clock" | "users", text: string, label: string) => (
    <button
      type="button"
      aria-expanded={open === k}
      aria-label={label}
      onClick={() => setOpen(open === k ? null : k)}
      className={`flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-input border px-3 text-left text-sm font-bold ${open === k ? "border-blue shadow-[inset_0_0_0_1px_rgb(var(--blue))]" : "border-line"}`}
    >
      <span className="text-blue"><Icon name={icon} size={18} /></span>
      <span className="truncate">{text}</span>
      <span className="ml-auto text-muted" aria-hidden="true">{open === k ? "▴" : "▾"}</span>
    </button>
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="flex gap-2">
          {pill("date", "clock", sel.date ? fmtDate(sel.date, { weekday: "short", day: "numeric", month: "short" }) : C.date, `${C.date}: ${sel.date ? fmtDate(sel.date) : "not set"}`)}
          {pill("guests", "users", `${sel.guests} ${sel.guests === 1 ? "guest" : "guests"}`, `${C.participants}: ${sel.guests}`)}
        </div>
        {open === "date" ? (
          <div className="rounded-input border border-line p-3">
            <Calendar
              value={sel.date}
              min={tomorrow()}
              onChange={(d) => {
                set({ date: d });
                setOpen(null);
              }}
            />
          </div>
        ) : null}
        {open === "guests" ? (
          <div className="flex items-center justify-between rounded-input border border-line p-3">
            <span>
              <b className="block">{C.participants}</b>
              <small className="text-muted">Up to {maxG}</small>
            </span>
            <span className="flex items-center gap-1">
              <button type="button" aria-label={copy.listing.fewer} disabled={sel.guests <= 1} onClick={() => set({ guests: sel.guests - 1 })} className="grid h-11 w-11 place-items-center rounded-full border border-line text-lg font-extrabold disabled:opacity-40">−</button>
              <output className="tnum w-8 text-center text-lg font-extrabold">{sel.guests}</output>
              <button type="button" aria-label={copy.listing.more} disabled={sel.guests >= maxG} onClick={() => set({ guests: sel.guests + 1 })} className="grid h-11 w-11 place-items-center rounded-full border border-line text-lg font-extrabold disabled:opacity-40">+</button>
            </span>
          </div>
        ) : null}
      </div>

      <fieldset className="m-0 grid gap-2.5 border-0 p-0">
        <legend className="mb-2 text-[13px] font-bold text-muted">{C.chooseOption}</legend>
        {modes.map(({ m, title, sub }) => {
          const on = sel.mode === m;
          return (
            <div key={m} className={`rounded-card border bg-bg transition-shadow ${on ? "border-blue shadow-[inset_0_0_0_1px_rgb(var(--blue))]" : "border-line"}`}>
              <label className="grid cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-start gap-2.5 p-3.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-sun">
                <input type="radio" name="option" checked={on} onChange={() => set({ mode: m })} className="mt-1 h-[18px] w-[18px] accent-[rgb(var(--blue))]" />
                <span className="grid gap-1">
                  <b className="text-base leading-tight">{title}</b>
                  <small className="text-[13px] text-muted">{sub}</small>
                  <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-xs font-bold">
                    <Icon name="clock" size={13} /> {p.timing}
                  </span>
                </span>
                <span className="text-right">
                  <b className="tnum block text-lg">{money(total(m))}</b>
                  <small className="text-xs text-muted">
                    {m === "private" ? C.inclPrivate : p.per === "pp" ? `${sel.guests} × ${money(p.price_eur)}` : perLabel(p.per)}
                  </small>
                </span>
              </label>

              {on && p.addons.length ? (
                <div className="grid gap-1.5 border-t border-line px-3.5 pb-3.5 pt-3">
                  <b className="text-[13px]">{C.extras}</b>
                  {p.addons.map((a) => (
                    <label key={a.id} className="grid cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-soft">
                      <input
                        type="checkbox"
                        checked={sel.adds.includes(a.id)}
                        onChange={(e) => set({ adds: e.target.checked ? [...sel.adds, a.id] : sel.adds.filter((x) => x !== a.id) })}
                        className="mt-0.5 h-[18px] w-[18px] accent-[rgb(var(--blue))]"
                      />
                      <span>
                        {a.label}
                        {a.popular ? <span className="text-xs font-bold text-rose-strong"> · {C.popular}</span> : null}
                        <small className="block text-xs text-muted">{perLabel(a.per)}</small>
                      </span>
                      <span className="tnum whitespace-nowrap font-bold">+{money(a.eur)}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}
