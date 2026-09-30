import type { Metadata } from "next";
import { Days, Filters, Kpis, type Row } from "@/components/dispatch/Board";
import { LiveRefresh } from "@/components/dispatch/LiveRefresh";
import { DispatchShell } from "@/components/dispatch/Shell";
import { CITY } from "@/lib/config";
import { addDays, isYmd, today } from "@/lib/dates";
import { getProducts } from "@/lib/db";
import { requireOperator } from "@/lib/operator";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dispatch", robots: { index: false } };

const COLS = "ref, product_id, product_title, date, guests, mode, addons, pickup, notes, lead_name, phone, total_eur, extra_eur, status, source, partner_code, payment_method, payment_status, paid_eur";

export default async function DispatchPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const gate = await requireOperator("/dispatch");
  if (!gate.ok) return <DispatchShell gate={gate} active="bookings">{null}</DispatchShell>;

  const t = today();
  const from = isYmd(searchParams.from) ? searchParams.from : t;
  const to = isYmd(searchParams.to) ? searchParams.to : addDays(t, 30);
  const status = searchParams.status ?? "";
  const product = searchParams.product ?? "";

  let q = supabaseAdmin()!.from("bookings").select(COLS).eq("city", CITY).gte("date", from).lte("date", to).order("date").limit(1000);
  q = status ? q.eq("status", status) : q.neq("status", "pending_payment");
  if (product) q = q.eq("product_id", product);
  const { data, error } = await q;
  const all = await getProducts();
  const products = all.map(({ id, title }) => ({ id, title }));
  const nonref = all.filter((p) => !p.refundable).map((p) => p.id);

  return (
    <DispatchShell gate={gate} active="bookings">
      <div className="mb-3"><LiveRefresh /></div>
      <Kpis rows={(data ?? []) as Row[]} today={t} />
      <Filters from={from} to={to} status={status} product={product} products={products} />
      {error ? <p role="alert" className="font-bold text-warn">Could not load bookings: {error.message}</p> : <Days rows={(data ?? []) as Row[]} nonref={nonref} />}
    </DispatchShell>
  );
}
