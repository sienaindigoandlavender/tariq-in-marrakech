"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { fmtDate, isYmd, tomorrow } from "@/lib/dates";
import { price, type PriceLine, type PriceResult } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { Icon } from "./Icons";
import { Poster } from "./Poster";
import { OptionsPanel, maxGuests, type Selection } from "./booking/OptionsPanel";

const C = copy.checkout;
const field = "min-h-[46px] w-full min-w-0 rounded-input border border-line bg-bg px-3 py-2.5 font-medium";
const label = "grid gap-1.5 text-[13px] font-bold";
const payCard =
  "relative grid cursor-pointer gap-0.5 rounded-input border border-line bg-bg p-3.5 text-sm has-[:checked]:border-blue has-[:checked]:shadow-[inset_0_0_0_1px_rgb(var(--blue))] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sun";
const DRAFT_KEY = "tq_draft";

type Pay = "later" | "now";
type Draft = Selection & { id: string; notes: string };

export function lineLabel(l: Pick<PriceLine, "kind" | "label" | "qty" | "unit_eur">, money: (n: number) => string): string {
  if (l.kind === "base") return `${C.base}: ${l.qty} × ${money(l.unit_eur)}`;
  if (l.kind === "private") return `${C.private}: ${l.qty} × ${money(l.unit_eur)}`;
  return `${l.label}${l.qty > 1 ? ` × ${l.qty}` : ""}`;
}

function Lines({ r, money }: { r: PriceResult; money: (n: number) => string }) {
  return (
    <div className="grid gap-1 text-[13.5px] font-medium text-muted">
      {r.lines.map((l) => (
        <span key={l.kind + l.id} className="flex justify-between gap-2.5">
          <span>{lineLabel(l, money)}</span>
          <span className="tnum">{money(l.eur)}</span>
        </span>
      ))}
    </div>
  );
}

function Section({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="grid gap-3.5 rounded-card border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-2.5 text-lg font-extrabold">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue text-sm text-blue-ink">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Checkout({ p, payNowAvailable }: { p: PublicProduct; payNowAvailable: boolean }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { money, prefs, setPrefs, last, setLast, addTrip, removeTrip, ready } = useAppState();
  const maxG = maxGuests(p);

  const [sel, setSel] = useState<Selection>({ date: "", guests: 2, mode: "shared", adds: [] });
  const [editing, setEditing] = useState(false);
  const [pickup, setPickup] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<Pay>("later");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Pre-fill once: draft left before a PayPal round trip > URL (from the sheet) > prefs cookie.
  const filled = useRef(false);
  useEffect(() => {
    if (!ready || filled.current) return;
    filled.current = true;
    const clampG = (n: number) => Math.min(maxG, Math.max(1, n || 2));
    const qd = sp.get("date");
    const qm = sp.get("mode");
    const next: Selection = {
      date: isYmd(qd) && qd >= tomorrow() ? qd : prefs.date || tomorrow(),
      guests: clampG(Number(sp.get("guests")) || prefs.guests),
      mode: qm === "private" && p.private_per_car ? "private" : "shared",
      adds: (sp.get("adds") ?? "").split(",").filter((a) => p.addons.some((x) => x.id === a)),
    };
    if (last) {
      setPickup(last.pickup);
      setName(last.name);
      setPhone(last.phone);
    }
    const back = sp.get("payment");
    if (back === "cancelled" || back === "failed") {
      const ref = sp.get("ref");
      if (ref) removeTrip(ref);
      try {
        const d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null") as Draft | null;
        if (d && d.id === p.id) {
          if (isYmd(d.date) && d.date >= tomorrow()) next.date = d.date;
          next.guests = clampG(d.guests);
          next.mode = d.mode === "private" && p.private_per_car ? "private" : "shared";
          next.adds = d.adds.filter((a) => p.addons.some((x) => x.id === a));
          setNotes(d.notes);
        }
      } catch {}
      setNotice(back === "cancelled" ? C.cancelled : C.failed);
      setPay("now");
      router.replace(`/book/${p.id}`, { scroll: false });
    } else if (!qm) {
      setEditing(true); // arrived without choosing an option (cross-sell, concierge, direct link)
    }
    setSel(next);
  }, [ready, sp, prefs, last, maxG, p, removeTrip, router]);

  const r = useMemo(() => price(p, { guests: sel.guests, mode: sel.mode, addonIds: sel.adds }), [p, sel]);
  const payNow = pay === "now" && payNowAvailable;

  const submit = async () => {
    setErr("");
    if (!isYmd(sel.date) || sel.date < tomorrow()) {
      setEditing(true);
      return setErr(C.errors.date);
    }
    if (pickup.trim().length < 3) return setErr(C.errors.pickup);
    if (name.trim().length < 2) return setErr(C.errors.name);
    if (phone.replace(/\D/g, "").length < 8) return setErr(C.errors.phone);
    setPrefs({ date: sel.date, guests: sel.guests });
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_id: p.id,
          date: sel.date,
          guests: sel.guests,
          mode: sel.mode,
          addon_ids: sel.adds,
          pickup,
          lead_name: name,
          phone,
          notes,
          payment: payNow ? "paypal" : "on_arrival",
          source: sp.get("src") === "concierge" ? "concierge" : "web",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        return setErr(data.error || C.shareFail);
      }
      const b = data.booking;
      setLast({ pickup: b.pickup, name: b.lead_name, phone: b.phone });
      addTrip({
        ref: b.ref,
        id: p.id,
        title: p.title,
        scene: p.scene,
        image_url: p.image_url,
        date: b.date,
        guests: b.guests,
        mode: b.mode,
        extras: b.lines.filter((l: PriceLine) => l.kind !== "base").map((l: PriceLine) => (l.kind === "private" ? C.private : l.label)),
        pickup: b.pickup,
        lead_name: b.lead_name,
        phone: b.phone,
        notes: b.notes,
        lines: b.lines,
        total: b.total_eur,
        persisted: !!data.persisted,
        payment: data.approve_url ? "paypal" : "on_arrival",
      });
      if (data.approve_url) {
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...sel, id: p.id, notes } satisfies Draft));
        } catch {}
        window.location.assign(data.approve_url);
        return;
      }
      router.push(`/done/${b.ref}`);
    } catch {
      setBusy(false);
      setErr(C.shareFail);
    }
  };

  const optionText = p.private_per_car ? (sel.mode === "private" ? C.private : C.shared) : C.standard;
  const extras = r.lines.filter((l) => l.kind === "addon").map((l) => l.label);
  const cta = busy ? (payNow ? C.redirecting : C.sending) : payNow ? C.payWith(money(r.total)) : C.confirm;

  const summary = (
    <div className="grid gap-3.5 rounded-card border border-line bg-surface p-4">
      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
        <Poster scene={p.scene} image_url={p.image_url} alt="" uid={`sum-${p.id}`} className="rounded-xl" />
        <div className="min-w-0">
          <p className="m-0 text-[13px] font-bold text-muted">{p.subtitle}</p>
          <p className="m-0 font-extrabold leading-tight">{p.title}</p>
        </div>
      </div>
      <ul className="m-0 grid list-none gap-1.5 p-0 text-sm">
        <li className="flex items-center gap-2"><Icon name="clock" size={18} />{sel.date ? fmtDate(sel.date) : "–"} · {p.timing}</li>
        <li className="flex items-center gap-2"><Icon name="users" size={18} />{sel.guests} {sel.guests === 1 ? "guest" : "guests"} · {optionText}</li>
        <li className="flex items-start gap-2 text-ok"><span className="mt-0.5"><Icon name="shield" size={18} /></span><span className="font-bold">{C.cancelPolicy}</span></li>
      </ul>
      <div className="border-t border-line pt-3">
        <Lines r={r} money={money} />
        <div className="mt-2 flex items-baseline justify-between">
          <b>{payNow ? C.payNow : C.total}</b>
          <b className="tnum text-2xl">{money(r.total)}</b>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-8 py-6 tab:grid-cols-[minmax(0,1fr)_300px] phone:grid-cols-1 phone:gap-4">
      <form
        noValidate
        className="grid min-w-0 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <h1 className="m-0 text-[26px] font-extrabold leading-tight">{C.checkoutH}</h1>

        {notice ? (
          <p role="status" className="m-0 rounded-input bg-sun/20 p-3 text-sm font-bold">
            {notice}
          </p>
        ) : null}

        <Section
          n={1}
          title={C.yourBooking}
          aside={
            <button type="button" aria-expanded={editing} onClick={() => setEditing((v) => !v)} className="min-h-[40px] rounded-full px-3 text-sm font-extrabold text-blue hover:bg-soft">
              {editing ? C.done : C.edit}
            </button>
          }
        >
          {editing ? (
            <OptionsPanel p={p} sel={sel} onChange={setSel} />
          ) : (
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3">
              <Poster scene={p.scene} image_url={p.image_url} alt="" uid={`yb-${p.id}`} className="rounded-lg" />
              <div className="min-w-0 text-sm">
                <b className="block text-base leading-tight">{p.title}</b>
                <span className="text-muted">
                  {sel.date ? fmtDate(sel.date, { weekday: "short", day: "numeric", month: "short" }) : "–"} · {p.timing} · {sel.guests} {sel.guests === 1 ? "guest" : "guests"} · {optionText}
                </span>
                {extras.length ? <span className="block text-muted">+ {extras.join(", ")}</span> : null}
              </div>
            </div>
          )}
        </Section>

        <Section n={2} title={C.contactH}>
          <p className="m-0 -mt-1.5 text-sm text-muted">{C.contactP}</p>
          <label className={label}>
            {C.pickupAt}
            <input value={pickup} onChange={(e) => setPickup(e.target.value)} maxLength={200} autoComplete="off" placeholder={C.pickupPlaceholder} className={field} />
          </label>
          <div className="grid grid-cols-2 gap-3 xs:grid-cols-1">
            <label className={label}>
              {C.name}
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={field} />
            </label>
            <label className={label}>
              {C.phone}
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} autoComplete="tel" placeholder={C.phonePlaceholder} className={field} />
            </label>
          </div>
          <label className={label}>
            {C.notes}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} className={`${field} min-h-[64px] resize-y`} />
          </label>
        </Section>

        <Section n={3} title={C.payH}>
          <fieldset className="m-0 grid gap-2 border-0 p-0" role="radiogroup" aria-label={C.payH}>
            {payNowAvailable ? (
              <label className={payCard}>
                <input type="radio" name="pay" value="now" checked={pay === "now"} onChange={() => setPay("now")} className="absolute opacity-0" />
                <span className="flex items-baseline justify-between gap-2">
                  <b className="text-base">{C.payNow}</b>
                  <span className="rounded bg-[#ffc439] px-2 py-0.5 text-xs font-extrabold italic text-[#003087]">PayPal</span>
                </span>
                <small className="text-muted">{C.payNowS}</small>
              </label>
            ) : null}
            <label className={payCard}>
              <input type="radio" name="pay" value="later" checked={pay === "later"} onChange={() => setPay("later")} className="absolute opacity-0" />
              <b className="text-base">{C.payLater}</b>
              <small className="text-muted">{C.payLaterS}</small>
            </label>
          </fieldset>
        </Section>

        {/* phone: the total sits right above the button */}
        <div className="hidden items-start justify-between gap-4 rounded-input bg-soft p-3.5 phone:flex">
          <div className="min-w-0 flex-1 text-sm font-bold">
            {payNow ? C.payNow : C.total}
            <div className="mt-1.5"><Lines r={r} money={money} /></div>
          </div>
          <span className="tnum text-[26px] font-extrabold leading-none">{money(r.total)}</span>
        </div>

        <p role="alert" className="m-0 min-h-[1em] text-[13px] font-bold text-warn">
          {err}
        </p>
        <button type="submit" disabled={busy} className="min-h-[54px] rounded-full bg-blue px-[18px] text-base font-extrabold text-blue-ink disabled:opacity-60">
          {cta}
        </button>
        <p className="m-0 -mt-1 text-center text-[12.5px] text-muted">{payNow ? `${C.paypalNote} ${C.paidNotice}` : C.noPay}</p>
      </form>

      <aside className="sticky top-[86px] phone:hidden" aria-label={C.summary}>
        {summary}
      </aside>
    </div>
  );
}
