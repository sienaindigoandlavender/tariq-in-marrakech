"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { formatWhatsapp, waLink } from "@/lib/config";
import { perLabel } from "@/lib/format";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { Poster } from "./Poster";

type Lite = Pick<PublicProduct, "id" | "title" | "price_eur" | "per" | "scene" | "image_url">;
type Msg = { role: "user" | "assistant"; text: string; picks: string[]; thinking?: boolean; wa?: boolean };

const K = copy.concierge;
const MAX = 500;

export function Concierge({ products }: { products: Lite[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { money, prefs } = useAppState();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const byId = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [msgs]);

  const ask = useCallback(
    async (text: string) => {
      const t = text.trim().slice(0, MAX);
      if (!t || busy) return;
      setBusy(true);
      const history = [...msgs.filter((m) => !m.thinking), { role: "user" as const, text: t, picks: [] }];
      setMsgs([...history, { role: "assistant", text: K.thinking, picks: [], thinking: true }]);
      const update = (fn: (m: Msg) => Msg) => setMsgs((prev) => [...prev.slice(0, -1), fn(prev[prev.length - 1])]);

      try {
        const res = await fetch("/api/concierge", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, text, picks }) => ({ role, text, picks })) }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          update((m) => ({ ...m, thinking: false, text: data.error || K.error, wa: true }));
        } else {
          const reader = res.body.getReader();
          const dec = new TextDecoder();
          let buf = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            let nl;
            while ((nl = buf.indexOf("\n")) >= 0) {
              const line = buf.slice(0, nl).trim();
              buf = buf.slice(nl + 1);
              if (!line) continue;
              const ev = JSON.parse(line);
              if (ev.t === "text") update((m) => ({ ...m, text: (m.thinking ? "" : m.text) + ev.v, thinking: false }));
              else if (ev.t === "products") update((m) => ({ ...m, picks: [...new Set([...m.picks, ...ev.ids])] }));
              else if (ev.t === "fallback") update((m) => ({ ...m, thinking: false, text: ev.text, picks: ev.ids, wa: !ev.ids.length }));
              else if (ev.t === "error") update((m) => ({ ...m, thinking: false, text: (m.thinking ? "" : m.text + "\n\n") + ev.text }));
              else if (ev.t === "open") router.push(`/book/${ev.id}?date=${prefs.date}&guests=${prefs.guests}&src=concierge`);
            }
          }
          update((m) => (m.thinking ? { ...m, thinking: false, text: K.error, wa: true } : m));
        }
      } catch {
        update((m) => ({ ...m, thinking: false, text: `${K.nomatch} ${formatWhatsapp()}`, wa: true }));
      }
      setBusy(false);
    },
    [busy, msgs, prefs, router],
  );

  // A question handed over from the hero ask bar.
  const handed = useRef(false);
  useEffect(() => {
    const first = sp.get("q");
    if (first && !handed.current) {
      handed.current = true;
      ask(first);
      router.replace("/concierge", { scroll: false });
    } else inputRef.current?.focus({ preventScroll: true });
  }, [sp, ask, router]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-200px)] max-w-[760px] flex-col gap-3.5 pb-4 pt-[22px]">
      <div className="flex items-center gap-3.5">
        <div className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[14px] bg-blue font-display text-[26px] font-black text-blue-ink">T</div>
        <div>
          <h1 className="m-0 text-xl font-extrabold">{K.h}</h1>
          <p className="m-0 text-sm text-muted">{K.p}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3" aria-live="polite">
        <div className="max-w-[86%] self-start whitespace-pre-wrap rounded-[18px] rounded-bl-md bg-soft px-3.5 py-2.5 text-[15px]">{K.hi}</div>
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="max-w-[86%] self-end whitespace-pre-wrap break-words rounded-[18px] rounded-br-md bg-blue px-3.5 py-2.5 text-[15px] text-blue-ink">
              {m.text}
            </div>
          ) : (
            <div key={i} className="grid gap-2.5">
              {m.text ? (
                <div className={`max-w-[86%] self-start whitespace-pre-wrap break-words rounded-[18px] rounded-bl-md bg-soft px-3.5 py-2.5 text-[15px] ${m.thinking ? "text-muted" : ""}`}>
                  {m.text}
                </div>
              ) : null}
              {m.picks.length ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
                  {m.picks.map(byId).filter((p): p is Lite => Boolean(p)).map((p) => (
                    <Link key={p.id} href={`/p/${p.id}`} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5 rounded-[14px] border border-line bg-surface p-2 no-underline hover:border-blue">
                      <Poster scene={p.scene} image_url={p.image_url} uid={`k${i}-${p.id}`} className="!aspect-square rounded-[10px]" />
                      <span>
                        <b className="block text-sm leading-tight">{p.title}</b>
                        <span className="text-[13px] text-muted">
                          {copy.price.from} <span className="tnum">{money(p.price_eur)}</span> {perLabel(p.per)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {m.wa ? (
                <a href={waLink("Hi Tariq, ")} target="_blank" rel="noopener" className="w-fit rounded-full bg-wa px-4 py-2.5 text-sm font-extrabold text-white no-underline">
                  WhatsApp {formatWhatsapp()}
                </a>
              ) : null}
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>

      {!msgs.length ? (
        <div className="flex flex-wrap gap-2">
          {K.suggestions.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="min-h-[40px] rounded-full border border-line bg-surface px-3 text-[13.5px] font-bold">
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = q;
          setQ("");
          ask(t);
        }}
        className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+10px)] z-20 flex gap-2 rounded-full border border-line bg-surface p-1.5 shadow-[0_6px_24px_rgb(0_0_0/.08)] phone:bottom-[calc(var(--tabh)+env(safe-area-inset-bottom,0px)+10px)]"
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={MAX}
          aria-label="Message Tariq"
          placeholder={K.placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 focus-visible:outline-none"
        />
        <button type="submit" disabled={busy || !q.trim()} className="min-h-[44px] rounded-full bg-blue px-[18px] font-extrabold text-blue-ink disabled:opacity-55">
          {K.send}
        </button>
      </form>
    </div>
  );
}
