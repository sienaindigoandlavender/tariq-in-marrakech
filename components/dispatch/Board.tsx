import { STATUS_LABEL } from "@/lib/dispatch";
import { fmtDate } from "@/lib/dates";
import type { Booking, BookingStatus } from "@/lib/types";
import { StatusControls } from "./StatusControls";

export type Row = Pick<
  Booking,
  "ref" | "product_id" | "product_title" | "date" | "guests" | "mode" | "addons" | "pickup" | "notes" | "lead_name" | "phone" | "total_eur" | "extra_eur" | "status" | "source" | "partner_code" | "payment_method" | "payment_status" | "paid_eur"
>;

const eur = (n: number) => "€" + Math.round(n).toLocaleString("en");
const live = (b: Row) => b.status !== "cancelled" && b.status !== "noshow" && b.status !== "pending_payment";
/** What the driver collects on the day. */
export const dueOnDay = (b: Row) => (b.payment_status === "paid" ? Math.max(0, Number(b.total_eur) - Number(b.paid_eur)) : Number(b.total_eur));

export function PayBadge({ b }: { b: Row }) {
  if (b.payment_status === "paid") return <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[11px] font-extrabold text-ok">Prepaid · PayPal</span>;
  if (b.payment_status === "refunded") return <span className="rounded-full bg-line px-2 py-0.5 text-[11px] font-extrabold text-muted">Refunded</span>;
  return null;
}
const waHref = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

export function Kpis({ rows, today }: { rows: Row[]; today: string }) {
  const l = rows.filter(live);
  const up = l.filter((b) => b.date >= today);
  const tiles = [
    ["Upcoming", String(up.length)],
    ["Guests", String(up.reduce((s, b) => s + b.guests, 0))],
    ["Booked value", eur(l.reduce((s, b) => s + Number(b.total_eur), 0))],
    ["From upsells", eur(l.reduce((s, b) => s + Number(b.extra_eur), 0))],
  ];
  return (
    <div className="mb-5 grid grid-cols-4 gap-3 phone:grid-cols-2">
      {tiles.map(([k, v]) => (
        <div key={k} className="rounded-card bg-soft px-3.5 py-3">
          <small className="text-xs font-bold uppercase tracking-[.05em] text-muted">{k}</small>
          <b className="tnum block text-[26px] font-extrabold">{v}</b>
        </div>
      ))}
    </div>
  );
}

export function Filters({ from, to, status, product, products }: { from: string; to: string; status: string; product: string; products: { id: string; title: string }[] }) {
  const f = "min-h-[44px] w-full rounded-input border border-line bg-bg px-3 font-medium";
  const l = "grid gap-1 text-[13px] font-bold";
  return (
    <form method="get" className="mb-5 grid grid-cols-[repeat(4,minmax(0,1fr))_auto] items-end gap-3 rounded-card bg-soft p-3 tab:grid-cols-2">
      <label className={l}>From<input type="date" name="from" defaultValue={from} className={f} /></label>
      <label className={l}>To<input type="date" name="to" defaultValue={to} className={f} /></label>
      <label className={l}>
        Status
        <select name="status" defaultValue={status} className={f}>
          <option value="">All</option>
          {(Object.keys(STATUS_LABEL) as BookingStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </label>
      <label className={l}>
        Product
        <select name="product" defaultValue={product} className={f}>
          <option value="">All</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </label>
      <button className="min-h-[44px] rounded-full bg-blue px-5 font-extrabold text-blue-ink tab:col-span-2">Filter</button>
    </form>
  );
}

function Extras({ b }: { b: Row }) {
  const x = b.addons.map((a) => (a.qty > 1 ? `${a.label} × ${a.qty}` : a.label));
  return <>{x.length ? x.join(", ") : "–"}</>;
}

export function Days({ rows, nonref = [] }: { rows: Row[]; nonref?: string[] }) {
  if (!rows.length) {
    return <p className="rounded-card bg-soft p-7 text-center text-muted">No bookings match. New bookings appear here grouped by day, with pickup, guests, extras and phone.</p>;
  }
  const byDay = new Map<string, Row[]>();
  for (const b of [...rows].sort((a, c) => (a.date + a.product_title).localeCompare(c.date + c.product_title))) {
    byDay.set(b.date, [...(byDay.get(b.date) ?? []), b]);
  }
  return (
    <>
      {[...byDay].map(([d, list]) => (
        <section key={d} className="mt-5">
          <h2 className="m-0 mb-2 text-[13px] font-bold uppercase tracking-[.08em] text-muted">
            {fmtDate(d, { weekday: "long", day: "numeric", month: "short" })} · {list.filter(live).reduce((s, b) => s + b.guests, 0)} guests
          </h2>

          {/* phone: cards */}
          <ul className="m-0 hidden list-none gap-2.5 p-0 phone:grid">
            {list.map((b) => (
              <li key={b.ref} className="grid gap-1.5 rounded-card border border-line p-3.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <b className="text-base">
                    {b.product_title}
                    {b.mode === "private" ? <span className="text-blue"> · Private</span> : null}
                  </b>
                  <span className="grid justify-items-end gap-1"><b className="tnum">{eur(dueOnDay(b))}</b><PayBadge b={b} /></span>
                </div>
                <span className="tnum text-muted">{b.ref} · {b.guests} guests{b.partner_code ? ` · ${b.partner_code}` : ""}</span>
                <span><b>Pickup:</b> {b.pickup}</span>
                <span><b>Extras:</b> <Extras b={b} /></span>
                {b.notes ? <span className="text-muted">{b.notes}</span> : null}
                <span>
                  {b.lead_name} · <a className="tnum font-bold" href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a> ·{" "}
                  <a className="font-bold text-wa" href={waHref(b.phone)} target="_blank" rel="noopener">WhatsApp</a>
                </span>
                <StatusControls refCode={b.ref} status={b.status} prepaid={b.payment_status === "paid"} refundable={!nonref.includes(b.product_id)} />
              </li>
            ))}
          </ul>

          {/* desktop: table */}
          <div className="overflow-x-auto rounded-card border border-line phone:hidden">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[.05em] text-muted">
                  {["Ref", "Product", "Guests", "Extras", "Pickup and notes", "Lead guest", "Due", "Status"].map((h) => (
                    <th key={h} className="border-b border-line px-3 py-2.5 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.ref} className="align-top [&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-2.5 last:[&>td]:border-0">
                    <td className="tnum whitespace-nowrap">{b.ref}{b.partner_code ? <span className="block text-xs text-muted">{b.partner_code}</span> : null}</td>
                    <td>{b.product_title}{b.mode === "private" ? <b className="text-blue"> · Private</b> : null}</td>
                    <td className="tnum">{b.guests}</td>
                    <td><Extras b={b} /></td>
                    <td>{b.pickup}{b.notes ? <span className="block text-xs text-muted">{b.notes}</span> : null}</td>
                    <td>
                      {b.lead_name}
                      <span className="block text-xs">
                        <a className="tnum" href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a> ·{" "}
                        <a className="font-bold text-wa" href={waHref(b.phone)} target="_blank" rel="noopener">WhatsApp</a>
                      </span>
                    </td>
                    <td className="tnum whitespace-nowrap font-bold">{eur(dueOnDay(b))}<span className="mt-1 block"><PayBadge b={b} /></span></td>
                    <td><StatusControls refCode={b.ref} status={b.status} prepaid={b.payment_status === "paid"} refundable={!nonref.includes(b.product_id)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
