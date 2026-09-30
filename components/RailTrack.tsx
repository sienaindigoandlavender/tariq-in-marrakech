"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** One-row, swipeable rail. Arrow buttons appear on devices with a pointer when the row overflows. */
export function RailTrack({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? "auto" : "smooth" });
  };

  const btn =
    "absolute top-[calc(var(--rail-img)/2)] z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-[0_6px_18px_rgb(0_0_0/.12)] transition-opacity phone:hidden";

  return (
    <div className="relative [--rail-img:calc((min(100vw,1180px)-40px-54px)/4*0.75)] tab:[--rail-img:calc((100vw-40px-36px)/3*0.75)]">
      <div
        ref={ref}
        onScroll={update}
        role="list"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-[18px] overflow-x-auto scroll-smooth pb-1 phone:-mx-4 phone:gap-3 phone:px-4 phone:scroll-px-4"
      >
        {children}
      </div>
      <button type="button" aria-label="Previous" onClick={() => go(-1)} className={`${btn} -left-4 ${edge.start ? "pointer-events-none opacity-0" : ""}`} tabIndex={edge.start ? -1 : 0}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" aria-label="Next" onClick={() => go(1)} className={`${btn} -right-4 ${edge.end ? "pointer-events-none opacity-0" : ""}`} tabIndex={edge.end ? -1 : 0}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
