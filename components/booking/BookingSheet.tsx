"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { tomorrow } from "@/lib/dates";
import { price } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "../AppState";
import { OptionsPanel, maxGuests, type Selection } from "./OptionsPanel";

const C = copy.checkout;
const Ctx = createContext<{ open: () => void } | null>(null);
export const useBookingSheet = () => useContext(Ctx) ?? { open: () => {} };

export function bookHref(id: string, s: Selection, extra = "") {
  const q = new URLSearchParams({ date: s.date, guests: String(s.guests), mode: s.mode });
  if (s.adds.length) q.set("adds", s.adds.join(","));
  return `/book/${id}?${q}${extra}`;
}

/** Wraps a product page: any child can open the availability sheet. */
export function BookingSheetRoot({ p, children }: { p: PublicProduct; children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  // Kept here so closing and reopening the sheet keeps what the guest picked.
  const [sel, setSel] = useState<Selection | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback(() => {
    opener.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);
  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  }, []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen ? <Sheet p={p} onClose={close} sel={sel} setSel={setSel} /> : null}
    </Ctx.Provider>
  );
}

function Sheet({ p, onClose, sel: saved, setSel }: { p: PublicProduct; onClose: () => void; sel: Selection | null; setSel: (s: Selection) => void }) {
  const router = useRouter();
  const { prefs, setPrefs, money } = useAppState();
  const sel: Selection = saved ?? {
    date: prefs.date && prefs.date >= tomorrow() ? prefs.date : tomorrow(),
    guests: Math.min(maxGuests(p), Math.max(1, prefs.guests || 2)),
    mode: "shared",
    adds: [],
  };
  const dialog = useRef<HTMLDivElement>(null);
  const total = price(p, { guests: sel.guests, mode: sel.mode, addonIds: sel.adds }).total;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLElement>("button, input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialog.current) {
        const f = [...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]')];
        if (!f.length) return;
        const [first, last] = [f[0], f[f.length - 1]];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const go = () => {
    setPrefs({ date: sel.date, guests: sel.guests });
    router.push(bookHref(p.id, sel));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgb(10_8_28/.55)] sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[24px] bg-surface shadow-2xl motion-safe:animate-[sheet_.22s_ease-out] sm:max-h-[88vh] sm:max-w-[560px] sm:rounded-[24px]"
      >
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden="true" />
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-3 sm:pt-5">
          <div className="min-w-0">
            <h2 id="sheet-title" className="m-0 text-xl font-extrabold">{copy.product.check}</h2>
            <p className="m-0 truncate text-sm text-muted">{p.title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={copy.done.close} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-soft text-lg font-extrabold">
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
          <OptionsPanel p={p} sel={sel} onChange={setSel} />
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line px-5 pt-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <div className="leading-tight">
            <b className="tnum block text-xl">{money(total)}</b>
            <small className="font-bold text-ok">{copy.listing.freeCancel}</small>
          </div>
          <button type="button" onClick={go} className="min-h-[50px] rounded-full bg-blue px-7 text-base font-extrabold text-blue-ink">
            {C.continue}
          </button>
        </footer>
      </div>
    </div>
  );
}
