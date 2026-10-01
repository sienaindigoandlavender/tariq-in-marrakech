"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import type { PublicProduct } from "@/lib/types";
import { Concierge, type Seed } from "./Concierge";
import { formatWhatsapp, waLink } from "@/lib/config";

type Lite = Pick<PublicProduct, "id" | "title" | "price_eur" | "per" | "scene" | "image_url">;

export const ASK_EVENT = "tariq:ask";

/** Open the floating Tariq chat from anywhere, optionally with a first question. */
export function askTariq(text?: string) {
  window.dispatchEvent(new CustomEvent(ASK_EVENT, { detail: { text: text?.trim().slice(0, 500) || "" } }));
}

const HIDDEN = ["/concierge", "/dispatch", "/login", "/book/", "/auth"];
/** Pages where the floating chat is off; send people to the full /concierge page instead. */
export const chatHidden = (path: string) => HIDDEN.some((h) => path.startsWith(h));

/** Site-wide chat bubble. Desktop: a 380×600 panel bottom-right. Phone: a full-screen sheet. */
export function ChatWidget({ products }: { products: Lite[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState<Seed>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const on = (e: Event) => {
      const text = (e as CustomEvent<{ text: string }>).detail?.text;
      setMounted(true);
      setOpen(true);
      if (text) setSeed((s) => ({ text, n: (s?.n ?? 0) + 1 }));
    };
    window.addEventListener(ASK_EVENT, on);
    return () => window.removeEventListener(ASK_EVENT, on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    const phone = window.matchMedia("(max-width: 760px)").matches;
    if (phone) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  if (chatHidden(path)) return null;
  const onProduct = path.startsWith("/p/");

  return (
    <div className="print:hidden">
      {mounted ? (
        <div
          role="dialog"
          aria-label="Ask Tariq"
          aria-hidden={!open}
          className={`fixed bottom-[160px] right-5 z-[45] flex h-[min(600px,calc(100dvh-190px))] w-[380px] flex-col overflow-hidden rounded-[22px] border border-line bg-bg shadow-[0_20px_60px_rgb(10_8_28/.28)] transition-[opacity,transform] duration-200 phone:inset-0 phone:h-[100dvh] phone:w-full phone:rounded-none phone:border-0 ${
            open ? "translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-3 opacity-0"
          }`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex flex-none items-center gap-3 border-b border-line bg-blue px-4 py-3 text-blue-ink">
            <div className="grid h-9 w-9 flex-none place-items-center rounded-[11px] bg-white/15 font-display text-[21px] font-black">T</div>
            <div className="min-w-0 flex-1 leading-tight">
              <b className="block text-[15px]">Tariq</b>
              <span className="text-[12.5px] opacity-80">Answers in seconds · a human on WhatsApp</span>
            </div>
            <button type="button" onClick={close} aria-label="Close chat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/15">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <Suspense>
              <Concierge products={products} variant="panel" seed={seed} onNavigate={close} />
            </Suspense>
          </div>
        </div>
      ) : null}

      <div
        className={`fixed right-5 z-[44] flex flex-col items-end gap-3 phone:right-4 ${open ? "phone:hidden" : ""} ${
          onProduct ? "bottom-5 phone:bottom-[calc(var(--tabh)+80px+env(safe-area-inset-bottom,0px))]" : "bottom-5 phone:bottom-[calc(var(--tabh)+14px+env(safe-area-inset-bottom,0px))]"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setMounted(true);
            setOpen((o) => !o);
          }}
          aria-label={open ? "Close chat" : "Ask Tariq"}
          aria-expanded={open}
          className="flex h-14 items-center gap-2 rounded-full bg-blue pl-4 pr-5 font-extrabold text-blue-ink shadow-[0_10px_30px_rgb(31_63_191/.35)] transition-transform hover:scale-[1.03] phone:h-[52px] phone:w-[52px] phone:justify-center phone:p-0"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {open ? (
              <path d="M6 9l6 6 6-6" />
            ) : (
              <>
                <path d="M5 18l-1 3 4-2h9a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 001 3z" />
                <path d="M9 10h.01M12 10h.01M15 10h.01" />
              </>
            )}
          </svg>
          <span className="phone:hidden">{open ? "Close" : "Ask Tariq"}</span>
        </button>
        <a
          href={waLink("Hi Tariq, ")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp ${formatWhatsapp()}`}
          title={`WhatsApp ${formatWhatsapp()}`}
          className="grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_10px_30px_rgb(0_0_0/.18)] transition-transform hover:scale-[1.05] phone:h-[52px] phone:w-[52px]"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2zm5.82 14.04c-.24.69-1.42 1.33-1.95 1.38-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.14-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.89 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.35z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
