import type { Metadata } from "next";
import Link from "next/link";
import { DispatchShell } from "@/components/dispatch/Shell";
import { CITY } from "@/lib/config";
import { today } from "@/lib/dates";
import { requireOperator } from "@/lib/operator";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PartnerForm } from "./PartnerForm";
import { togglePartner } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partners", robots: { index: false } };

const eur = (n: number) => "€" + (Math.round(n * 100) / 100).toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function monthBounds(m: string) {
  const [y, mo] = m.split("-").map(Number);
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  return { from: `${m}-01`, to: `${next}-01` };
}

export default async function PartnersPage({ searchParams }: { searchParams: { month?: string } }) {
  const gate = await requireOperator("/dispatch/partners");
  if (!gate.ok) return <DispatchShell gate={gate} active="partners">{null}</DispatchShell>;

  const month = /^\d{4}-\d{2}$/.test(searchParams.month ?? "") ? searchParams.month! : today().slice(0, 7);
  const { from, to } = monthBounds(month);
  const admin = supabaseAdmin()!;
  const [{ data: partners }, { data: rows }] = await Promise.all([
    admin.from("partners").select("code, name, commission_pct, active").eq("city", CITY).order("code"),
    admin.from("bookings").select("partner_code, total_eur, status, payment_status").eq("city", CITY).not("partner_code", "is", null).gte("date", from).lt("date", to),
  ]);

  const stats = new Map<string, { n: number; booked: number; paid: number }>();
  for (const r of rows ?? []) {
    if (r.status === "cancelled" || r.status === "noshow" || r.status === "pending_payment" || r.payment_status === "refunded") continue;
    const s = stats.get(r.partner_code) ?? { n: 0, booked: 0, paid: 0 };
    s.n++;
    s.booked += Number(r.total_eur);
    if (r.status === "paid" || r.payment_status === "paid") s.paid += Number(r.total_eur);
    stats.set(r.partner_code, s);
  }

  return (
    <DispatchShell gate={gate} active="partners">
      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-[13px] font-bold">
          Month
          <input type="month" name="month" defaultValue={month} className="min-h-[44px] rounded-input border border-line bg-bg px-3 font-medium" />
        </label>
        <button className="min-h-[44px] rounded-full border border-line px-5 font-bold">Show</button>
      </form>
      <p className="mb-4 text-sm text-muted">Commission is owed on paid bookings (cash on the day or PayPal) whose trip date falls in this month. Cancelled and no-show bookings are excluded.</p>

      <div className="mb-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[.05em] text-muted">
              {["Code", "Riad", "Bookings", "Booked", "Paid", "Commission", "Owed", ""].map((h) => (
                <th key={h} className="border-b border-line px-3 py-2.5 font-bold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(partners ?? []).map((p) => {
              const s = stats.get(p.code) ?? { n: 0, booked: 0, paid: 0 };
              return (
                <tr key={p.code} className={`[&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-2.5 ${p.active ? "" : "text-muted"}`}>
                  <td className="tnum font-bold">{p.code}</td>
                  <td>{p.name}{p.active ? "" : " (inactive)"}</td>
                  <td className="tnum">{s.n}</td>
                  <td className="tnum">{eur(s.booked)}</td>
                  <td className="tnum">{eur(s.paid)}</td>
                  <td className="tnum">{Number(p.commission_pct)}%</td>
                  <td className="tnum font-extrabold">{eur((s.paid * Number(p.commission_pct)) / 100)}</td>
                  <td className="whitespace-nowrap">
                    <Link href={`/dispatch/partners/${p.code}/card`} className="font-bold">QR card</Link>
                    <form action={togglePartner} className="ml-3 inline">
                      <input type="hidden" name="code" value={p.code} />
                      <input type="hidden" name="active" value={String(p.active)} />
                      <button className="text-muted underline">{p.active ? "Deactivate" : "Activate"}</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!partners?.length ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-muted">No partners yet. Add the first riad below.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <h2 className="m-0 mb-3 text-lg font-extrabold">Add or update a partner</h2>
      <PartnerForm />
    </DispatchShell>
  );
}
