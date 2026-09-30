import type { Metadata } from "next";
import { dueOnDay, type Row } from "@/components/dispatch/Board";
import { LiveRefresh } from "@/components/dispatch/LiveRefresh";
import { DispatchShell } from "@/components/dispatch/Shell";
import { StatusControls } from "@/components/dispatch/StatusControls";
import { CITY } from "@/lib/config";
import { fmtDate, tomorrow } from "@/lib/dates";
import { getProducts } from "@/lib/db";
import { pickupMinutes } from "@/lib/dispatch";
import { requireOperator } from "@/lib/operator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tomorrow's pickups", robots: { index: false } };

export default async function TomorrowPage() {
  const gate = await requireOperator("/dispatch/tomorrow");
  if (!gate.ok) return <DispatchShell gate={gate} active="tomorrow">{null}</DispatchShell>;

  const day = tomorrow();
  const { data } = await supabaseAdmin()!
    .from("bookings")
    .select("ref, product_id, product_title, date, guests, mode, addons, pickup, notes, lead_name, phone, total_eur, extra_eur, status, source, partner_code, payment_method, payment_status, paid_eur")
    .eq("city", CITY)
    .eq("date", day)
    .not("status", "in", "(cancelled,noshow,pending_payment)");
  const all = await getProducts();
  const timing = new Map(all.map((p) => [p.id, p.timing]));
  const nonref = new Set(all.filter((p) => !p.refundable).map((p) => p.id));
  const rows = ((data ?? []) as Row[])
    .map((b) => ({ ...b, timing: timing.get(b.product_id) ?? "", min: pickupMinutes(timing.get(b.product_id) ?? "") }))
    .sort((a, b) => a.min - b.min || a.product_title.localeCompare(b.product_title));

  return (
    <DispatchShell gate={gate} active="tomorrow">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="m-0 text-lg font-extrabold">{fmtDate(day)} · {rows.reduce((s, b) => s + b.guests, 0)} guests</h2>
        <LiveRefresh />
      </div>
      {rows.length ? (
        <ol className="m-0 grid list-none gap-2.5 p-0">
          {rows.map((b) => (
            <li key={b.ref} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-card border border-line p-3.5 text-sm xs:grid-cols-1">
              <b className="tnum text-base text-blue">{b.timing || "Time TBC"}</b>
              <div className="grid gap-1">
                <b className="text-base">{b.product_title}{b.mode === "private" ? " · Private" : ""} · {b.guests} guests</b>
                <span><b>Pickup:</b> {b.pickup}</span>
                {b.addons.length ? <span><b>Bring:</b> {b.addons.map((a) => (a.qty > 1 ? `${a.label} × ${a.qty}` : a.label)).join(", ")}</span> : null}
                {b.notes ? <span className="text-muted">{b.notes}</span> : null}
                <span>
                  {b.lead_name} · <a className="tnum font-bold" href={`tel:${b.phone.replace(/[^\d+]/g, "")}`}>{b.phone}</a> · {b.ref} · due €{Math.round(dueOnDay(b))}{b.payment_status === "paid" ? " (prepaid)" : ""}
                </span>
                <StatusControls refCode={b.ref} status={b.status} prepaid={b.payment_status === "paid"} refundable={!nonref.has(b.product_id)} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-card bg-soft p-7 text-center text-muted">No pickups tomorrow yet.</p>
      )}
    </DispatchShell>
  );
}
