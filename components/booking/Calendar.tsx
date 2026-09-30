"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/lib/dates";

const WD = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthName = (y: number, m: number) => new Date(Date.UTC(y, m, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const ymd = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** Compact month calendar. Dates before `min` are disabled. Arrow keys move the selection. */
export function Calendar({ value, min, onChange }: { value: string; min: string; onChange: (d: string) => void }) {
  const start = value || min;
  const [view, setView] = useState({ y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 });
  const minView = { y: Number(min.slice(0, 4)), m: Number(min.slice(5, 7)) - 1 };
  const canPrev = view.y > minView.y || (view.y === minView.y && view.m > minView.m);

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay(); // 0 = Sunday
    const lead = (first + 6) % 7;
    const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => ymd(view.y, view.m, i + 1))];
  }, [view]);

  const shift = (n: number) => setView(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (((m + n) % 12) + 12) % 12 }));

  const onKey = (e: React.KeyboardEvent, d: string) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = addDays(d, step);
    if (next < min) return;
    onChange(next);
    setView({ y: Number(next.slice(0, 4)), m: Number(next.slice(5, 7)) - 1 });
    requestAnimationFrame(() => (document.querySelector(`[data-day="${next}"]`) as HTMLElement | null)?.focus());
  };

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month" className="grid h-10 w-10 place-items-center rounded-full text-lg font-extrabold hover:bg-soft disabled:opacity-30">
          ‹
        </button>
        <b aria-live="polite">{monthName(view.y, view.m)}</b>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className="grid h-10 w-10 place-items-center rounded-full text-lg font-extrabold hover:bg-soft">
          ›
        </button>
      </div>
      <div role="grid" className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {WD.map((w) => (
          <span key={w} role="columnheader" className="pb-1 text-xs font-bold text-muted">{w}</span>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={d}
              type="button"
              data-day={d}
              role="gridcell"
              disabled={d < min}
              aria-selected={d === value}
              aria-label={new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}
              tabIndex={d === (value || min) ? 0 : -1}
              onClick={() => onChange(d)}
              onKeyDown={(e) => onKey(e, d)}
              className={`mx-auto grid h-10 w-10 place-items-center rounded-full font-bold disabled:font-normal disabled:text-muted/50 ${
                d === value ? "bg-blue text-blue-ink" : "enabled:hover:bg-soft"
              }`}
            >
              {Number(d.slice(8))}
            </button>
          ) : (
            <span key={"x" + i} />
          ),
        )}
      </div>
    </div>
  );
}
