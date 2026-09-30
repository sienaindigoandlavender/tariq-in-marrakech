"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { isYmd, tomorrow } from "@/lib/dates";
import { perLabel } from "@/lib/format";
import { price, type PriceLine } from "@/lib/pricing";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { Poster } from "./Poster";

const C = copy.checkout;
const field = "min-h-[46px] w-full min-w-0 rounded-input border border-line bg-bg px-3 py-2.5 font-medium";
const label = "grid gap-1.5 text-[13px] font-bold";

export function lineLabel(l: Pick<PriceLine, "kind" | "label" | "qty" | "unit_eur">, money: (n: number) => string): string {
  if (l.kind === "base") return `${C.base}: ${l.qty} × ${money(l.unit_eur)}`;
  if (l.kind === "private") return `${C.private}: ${l.qty} × ${money(l.unit_eur)}`;
  return `${l.label}${l.qty > 1 ? ` × ${l.qty}` : ""}`;
}

function Steps({ step }: { step: number }) {
  return (
    <ol className="m-0 flex list-none gap-2 p-0" aria-label={C.stepOf(step)}>
      {C.steps.map((s, i) => {
        const n = i + 1;
        const state = n < step ? "done" : n === step ? "now" : "todo";
        return (
          <li key={s} aria-current={state === "now" ? "step" : undefined} className="flex flex-1 flex-col gap-1.5 text-[13px] font-bold">
            <span className={`h-1.5 rounded-full ${state === "todo" ? "bg-line" : "bg-blue"}`} />
            <span className={state === "todo" ? "text-muted" : "text-ink"}>
              {n}. {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Checkout({ p }: { p: PublicProduct }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { money, prefs, setPrefs, last, setLast, addTrip, ready } = useAppState();
  const maxG = p.per === "car" ? 9 : 14;

  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [mode, setMode] = useState<"shared" | "private">("shared");
  const [adds, setAdds] = useState<string[]>([]);
  const [pickup, setPickup] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  // Pre-fill once: URL > saved prefs cookie; details from the last booking on this device.
  const filled = useRef(false);
  useEffect(() => {
    if (!ready || filled.current) return;
    filled.current = true;
    const qd = sp.get("date");
    const qg = Number(sp.get("guests"));
    setDate(isYmd(qd) && qd >= tomorrow() ? qd : prefs.date || tomorrow());
    setGuests(Math.min(maxG, Math.max(1, qg || prefs.guests || 2)));
    if (last) {
      setPickup(last.pickup);
      setName(last.name);
      setPhone(last.phone);
    }
  }, [ready, sp, prefs, last, maxG]);

  useEffect(() => {
    headRef.current?.focus();
  }, [step]);

  const r = useMemo(() => price(p, { guests, mode, addonIds: adds }), [p, guests, mode, adds]);
  const priceFor = (m: "shared" | "private") => price(p, { guests, mode: m, addonIds: adds }).total;

  const next = () => {
    setErr("");
    if (step === 1) {
      if (!isYmd(date) || date < tomorrow()) return setErr(C.errors.date);
      setPrefs({ date, guests });
    }
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    setErr("");
    if (!isYmd(date) || date < tomorrow()) {
      setStep(1);
      return setErr(C.errors.date);
    }
    if (pickup.trim().length < 3) return setErr(C.errors.pickup);
    if (name.trim().length < 2) return setErr(C.errors.name);
    if (phone.replace(/\D/g, "").length < 8) return setErr(C.errors.phone);
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_id: p.id,
          date,
          guests,
          mode,
          addon_ids: adds,
          pickup,
          lead_name: name,
          phone,
          notes,
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
      });
      router.push(`/done/${b.ref}`);
    } catch {
      setBusy(false);
      setErr(C.shareFail);
    }
  };

  const Total = () => (
    <div className="flex items-start justify-between gap-4 rounded-input bg-soft p-3.5">
      <div className="min-w-0 flex-1 text-sm font-bold">
        {C.total}
        <div className="mt-1.5 grid gap-1 text-[13.5px] font-medium text-muted">
          {r.lines.map((l) => (
            <span key={l.kind + l.id} className="flex justify-between gap-2.5">
              <span>{lineLabel(l, money)}</span>
              <span className="tnum">{money(l.eur)}</span>
            </span>
          ))}
        </div>
      </div>
      <span className="tnum text-[26px] font-extrabold leading-none" aria-live="polite">
        {money(r.total)}
      </span>
    </div>
  );

  const option = (m: "shared" | "private", title: string, sub: string, extra?: number) => (
    <label key={m} className="relative grid cursor-pointer gap-0.5 rounded-input border border-line bg-bg p-3.5 text-sm has-[:checked]:border-blue has-[:checked]:shadow-[inset_0_0_0_1px_rgb(var(--blue))] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sun">
      <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="absolute opacity-0" />
      <span className="flex items-baseline justify-between gap-2">
        <b className="text-base">
          {title}
          {extra ? <span className="tnum font-bold text-muted"> +{money(extra)} {perLabel("car")}</span> : null}
        </b>
        <span className="tnum font-extrabold">{money(priceFor(m))}</span>
      </span>
      <small className="text-muted">{sub}</small>
      <small className="font-bold">{p.timing}</small>
    </label>
  );

  return (
    <div className="mx-auto grid max-w-[640px] gap-5 py-6">
      <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3.5">
        <Poster scene={p.scene} image_url={p.image_url} alt="" uid={`ck-${p.id}`} className="rounded-xl" />
        <div>
          <p className="m-0 text-sm font-bold text-muted">{p.subtitle}</p>
          <p className="m-0 text-lg font-extrabold leading-tight">{p.title}</p>
        </div>
      </div>

      <Steps step={step} />

      <h1 ref={headRef} tabIndex={-1} className="m-0 text-2xl font-extrabold focus:outline-none">
        {C.steps[step - 1]}
      </h1>

      <form
        noValidate
        className="grid gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else submit();
        }}
      >
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className={label}>
                {C.date}
                <input type="date" min={tomorrow()} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
              </label>
              <label className={label}>
                {C.guests}
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={field}>
                  {Array.from({ length: maxG }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="m-0 grid gap-2 border-0 p-0" role="radiogroup">
              <legend className="mb-2 text-[13px] font-bold">{C.shared} / {C.private}</legend>
              {option("shared", p.private_per_car ? C.shared : C.standard, p.private_per_car ? C.sharedS : p.subtitle)}
              {p.private_per_car ? option("private", C.private, C.privateS, p.private_per_car) : null}
            </fieldset>
          </>
        )}

        {step === 2 && (
          <>
            {p.addons.length ? (
              <div className="grid gap-2">
                {p.addons.map((a) => (
                  <label key={a.id} className="grid cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-start gap-2.5 rounded-input border border-line bg-bg p-3 text-[14.5px] has-[:checked]:border-blue has-[:checked]:shadow-[inset_0_0_0_1px_rgb(var(--blue))]">
                    <input
                      type="checkbox"
                      checked={adds.includes(a.id)}
                      onChange={(e) => setAdds((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))}
                      className="mt-0.5 h-[18px] w-[18px] accent-[rgb(var(--blue))]"
                    />
                    <span>
                      <b className="block font-bold">
                        {a.label}
                        {a.popular ? <span className="text-xs font-bold text-rose"> · {C.popular}</span> : null}
                      </b>
                      <small className="text-[13px] text-muted">{perLabel(a.per)}</small>
                    </span>
                    <span className="tnum whitespace-nowrap font-extrabold">+{money(a.eur)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="m-0 rounded-input bg-soft p-4 text-muted">{C.noExtras}</p>
            )}
          </>
        )}

        {step === 3 && (
          <>
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
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000} className={`${field} min-h-[70px] resize-y`} />
            </label>
          </>
        )}

        <Total />
        <p role="alert" className="m-0 min-h-[1em] text-[13px] font-bold text-warn">
          {err}
        </p>

        <div className="flex gap-2.5">
          {step > 1 ? (
            <button type="button" onClick={() => { setErr(""); setStep((s) => s - 1); }} className="min-h-[50px] rounded-full border border-line px-5 font-extrabold">
              {C.back}
            </button>
          ) : null}
          <button type="submit" disabled={busy} className="min-h-[50px] flex-1 rounded-full bg-blue px-[18px] text-base font-extrabold text-blue-ink disabled:opacity-60">
            {step < 3 ? C.continue : busy ? C.sending : C.confirm}
          </button>
        </div>
        {step === 3 ? <p className="m-0 text-[12.5px] text-muted">{C.noPay}</p> : null}
      </form>
    </div>
  );
}
