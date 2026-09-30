"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatWhatsapp, waLink } from "@/lib/config";
import { fmtDate, today } from "@/lib/dates";
import { BUDGETS, NEEDS, STYLES, type PackageDef } from "@/lib/plan";
import { useAppState } from "./AppState";

const field = "min-h-[46px] w-full min-w-0 rounded-input border border-line bg-bg px-3 py-2.5 font-medium";
const label = "grid gap-1.5 text-[13px] font-bold";

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-[42px] rounded-full border px-3.5 text-sm font-bold transition-colors ${on ? "border-blue bg-blue text-blue-ink" : "border-line bg-surface text-ink hover:border-ink"}`}
    >
      {children}
    </button>
  );
}

function Stepper({ id, value, min, max, onChange }: { id: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div role="group" aria-labelledby={id} className="flex min-h-[46px] items-center rounded-input border border-line bg-bg">
      <button type="button" aria-label="Fewer" disabled={value <= min} onClick={() => onChange(value - 1)} className="h-11 w-11 text-lg font-extrabold disabled:opacity-40">
        −
      </button>
      <output aria-live="polite" className="tnum flex-1 text-center text-base">{value}</output>
      <button type="button" aria-label="More" disabled={value >= max} onClick={() => onChange(value + 1)} className="h-11 w-11 text-lg font-extrabold disabled:opacity-40">
        +
      </button>
    </div>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 rounded-card border border-line bg-surface p-4 sm:p-5">
      <div>
        <h2 className="m-0 text-lg font-extrabold">{title}</h2>
        {hint ? <p className="m-0 mt-0.5 text-sm text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

type Done = { ref: string; stored: boolean; summary: string };

export function PlanForm({ pkg, pkgItems }: { pkg: PackageDef | null; pkgItems: string[] }) {
  const { last, setLast, ready } = useAppState();
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(pkg?.id === "family" ? 1 : 0);
  const [style, setStyle] = useState<string | null>(pkg?.style ?? null);
  const [needs, setNeeds] = useState<string[]>(pkg?.needs ?? []);
  const [budget, setBudget] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<{ msg: string; field?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    if (ready && last) {
      setName((n) => n || last.name);
      setPhone((p) => p || last.phone);
    }
  }, [ready, last]);

  const toggle = (id: string) => setNeeds((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ arrival, departure, adults, children, style, needs, budget, package_id: pkg?.id, lead_name: name, phone, email, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr({ msg: data.error ?? "Something went wrong. Please try again.", field: data.field });
        return;
      }
      setLast({ pickup: last?.pickup ?? "", name, phone });
      const lines = [
        `Trip request ${data.ref}`,
        pkg ? `Package: ${pkg.title}` : null,
        arrival ? `Dates: ${fmtDate(arrival)}${departure ? ` to ${fmtDate(departure)}` : ""}` : null,
        `Guests: ${adults} adult${adults > 1 ? "s" : ""}${children ? `, ${children} child${children > 1 ? "ren" : ""}` : ""}`,
        style ? `Style: ${STYLES.find((s) => s.id === style)?.label}` : null,
        needs.length ? `Needs: ${needs.map((n) => NEEDS.find((x) => x.id === n)?.label).join(", ")}` : null,
        budget ? `Budget: ${BUDGETS.find((b) => b.id === budget)?.label}` : null,
        `Name: ${name}`,
        notes || null,
      ].filter(Boolean);
      setDone({ ref: data.ref, stored: data.stored, summary: lines.join("\n") });
      window.scrollTo({ top: 0 });
    } catch {
      setErr({ msg: "No connection. Check your internet and try again, or message us on WhatsApp." });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto grid max-w-[620px] gap-4 py-6">
        <div className="grid gap-2 rounded-card border-2 border-dashed border-blue p-5">
          <span className="text-sm font-bold text-muted">Request received</span>
          <span className="display text-[34px]">{done.ref}</span>
          <p className="m-0 text-[15px]">
            {done.stored
              ? "A real person reads every request. We reply on WhatsApp with a plan and prices, usually within a few hours, daily 8:00–22:00."
              : "Tap the button below so the team receives your request on WhatsApp. We reply with a plan and prices, daily 8:00–22:00."}
          </p>
        </div>
        <a href={waLink(done.summary)} target="_blank" rel="noopener noreferrer" className="min-h-[52px] rounded-full bg-wa px-5 py-3.5 text-center font-extrabold text-white no-underline">
          {done.stored ? "Also send it on WhatsApp" : "Send my request on WhatsApp"}
        </a>
        <p className="m-0 text-center text-sm text-muted">
          WhatsApp <span className="tnum select-all font-bold text-ink">{formatWhatsapp()}</span> · Meanwhile, you can <Link href="/c/all">book single trips</Link>{" "}
          straight away.
        </p>
      </div>
    );
  }

  const invalid = (f: string) => (err?.field === f ? "border-warn" : "");

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {pkg ? (
        <div className="rounded-card bg-soft p-4 text-[15px]">
          <b>Starting point</b>
          <p className="m-0 mt-1 text-muted">{pkgItems.join(" · ")}. Tell us your dates and we adapt it to your group.</p>
        </div>
      ) : null}

      <Block title="When and who">
        <div className="grid grid-cols-2 gap-3 xs:grid-cols-1">
          <label className={label}>
            Arrival
            <input type="date" min={today()} value={arrival} onChange={(e) => setArrival(e.target.value)} className={`${field} ${invalid("arrival")}`} />
          </label>
          <label className={label}>
            Departure
            <input type="date" min={arrival || today()} value={departure} onChange={(e) => setDeparture(e.target.value)} className={`${field} ${invalid("departure")}`} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={label}>
            <span id="adults-l">Adults</span>
            <Stepper id="adults-l" value={adults} min={1} max={30} onChange={setAdults} />
          </div>
          <div className={label}>
            <span id="children-l">Children</span>
            <Stepper id="children-l" value={children} min={0} max={20} onChange={setChildren} />
          </div>
        </div>
      </Block>

      <Block title="What kind of trip?" hint="Pick one.">
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} on={style === s.id} onClick={() => setStyle(style === s.id ? null : s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Block>

      <Block title="What do you need?" hint="Pick as many as you like.">
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <Chip key={n.id} on={needs.includes(n.id)} onClick={() => toggle(n.id)}>
              {n.label}
            </Chip>
          ))}
        </div>
      </Block>

      <Block title="Budget for the group" hint="Trips, transfers and services, not accommodation.">
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <Chip key={b.id} on={budget === b.id} onClick={() => setBudget(budget === b.id ? null : b.id)}>
              {b.label}
            </Chip>
          ))}
        </div>
      </Block>

      <Block title="How we reach you">
        <div className="grid grid-cols-2 gap-3 xs:grid-cols-1">
          <label className={label}>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={`${field} ${invalid("lead_name")}`} />
          </label>
          <label className={label}>
            WhatsApp number
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} autoComplete="tel" placeholder="+33 6 12 34 56 78" className={`${field} ${invalid("phone")}`} />
          </label>
        </div>
        <label className={label}>
          Email <span className="font-medium text-muted">(optional)</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} autoComplete="email" className={`${field} ${invalid("email")}`} />
        </label>
        <label className={label}>
          Anything else? <span className="font-medium text-muted">(riad name, occasion, children&rsquo;s ages, must-sees)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1500} className={`${field} min-h-[88px] resize-y`} />
        </label>
      </Block>

      <p role="alert" className="m-0 min-h-[1em] text-[13px] font-bold text-warn">
        {err?.msg}
      </p>
      <button type="submit" disabled={busy} className="min-h-[54px] rounded-full bg-blue px-5 text-base font-extrabold text-blue-ink disabled:opacity-60">
        {busy ? "Sending…" : "Send my request"}
      </button>
      <p className="m-0 -mt-1 text-center text-[12.5px] text-muted">
        Free, no obligation. Nothing is booked until you confirm. See our <Link href="/privacy">privacy policy</Link>.
      </p>
    </form>
  );
}
