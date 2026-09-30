import type { Metadata } from "next";
import { DispatchShell } from "@/components/dispatch/Shell";
import { CITY, waLink } from "@/lib/config";
import { fmtDate } from "@/lib/dates";
import { requireOperator } from "@/lib/operator";
import { BUDGETS, LEAD_STATUSES, NEEDS, STYLES, packageById, type LeadStatus } from "@/lib/plan";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setLeadStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trip requests", robots: { index: false } };

type Lead = {
  ref: string;
  arrival: string | null;
  departure: string | null;
  adults: number;
  children: number;
  style: string | null;
  needs: string[];
  budget: string | null;
  package_id: string | null;
  lead_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: LeadStatus;
  partner_code: string | null;
  source: string;
  created_at: string;
};

const TONE: Record<LeadStatus, string> = {
  new: "bg-sun text-sun-ink",
  contacted: "bg-blue/15 text-ink",
  quoted: "bg-blue text-blue-ink",
  won: "bg-ok text-white",
  lost: "bg-soft text-muted",
};

const label = <T extends readonly { id: string; label: string }[]>(list: T, id: string | null) => list.find((x) => x.id === id)?.label ?? null;

export default async function LeadsPage({ searchParams }: { searchParams: { status?: string } }) {
  const gate = await requireOperator("/dispatch/leads");
  if (!gate.ok) return <DispatchShell gate={gate} active="leads">{null}</DispatchShell>;

  const filter = LEAD_STATUSES.some((s) => s.id === searchParams.status) ? (searchParams.status as LeadStatus) : null;
  let q = supabaseAdmin()!.from("leads").select("*").eq("city", CITY).order("created_at", { ascending: false }).limit(200);
  if (filter) q = q.eq("status", filter);
  const { data, error } = await q;
  const leads = (data ?? []) as Lead[];

  const { data: all } = await supabaseAdmin()!.from("leads").select("status").eq("city", CITY);
  const counts = Object.fromEntries(LEAD_STATUSES.map((s) => [s.id, (all ?? []).filter((r) => r.status === s.id).length])) as Record<LeadStatus, number>;

  return (
    <DispatchShell gate={gate} active="leads">
      <div className="mb-4 flex flex-wrap gap-2">
        <a href="/dispatch/leads" className={`min-h-[36px] rounded-full border px-3 py-1.5 text-sm font-bold no-underline ${!filter ? "border-ink bg-ink text-bg" : "border-line text-muted"}`}>
          All
        </a>
        {LEAD_STATUSES.map((s) => (
          <a
            key={s.id}
            href={`/dispatch/leads?status=${s.id}`}
            className={`min-h-[36px] rounded-full border px-3 py-1.5 text-sm font-bold no-underline ${filter === s.id ? "border-ink bg-ink text-bg" : "border-line text-muted"}`}
          >
            {s.label} <span className="tnum opacity-70">{counts[s.id]}</span>
          </a>
        ))}
      </div>

      {error ? (
        <p className="rounded-card bg-soft p-5 text-muted">
          Couldn&apos;t load trip requests ({error.message}). If the table is missing, run supabase/migrations/0005_leads.sql.
        </p>
      ) : !leads.length ? (
        <p className="rounded-card bg-soft p-5 text-muted">No trip requests yet. They appear here as soon as a guest sends the Plan my trip form.</p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {leads.map((l) => {
            const pkg = packageById(l.package_id);
            const guests = `${l.adults} adult${l.adults > 1 ? "s" : ""}${l.children ? `, ${l.children} child${l.children > 1 ? "ren" : ""}` : ""}`;
            const reply = `Hello ${l.lead_name.split(" ")[0]}, this is Tariq in Marrakech about your trip request ${l.ref}. `;
            return (
              <li key={l.ref} className="grid gap-3 rounded-card border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-lg">{l.lead_name}</b>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${TONE[l.status]}`}>{label(LEAD_STATUSES, l.status)}</span>
                      {pkg ? <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold">{pkg.title}</span> : null}
                      {l.partner_code ? <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-bold">via {l.partner_code}</span> : null}
                    </div>
                    <p className="m-0 mt-1 text-sm text-muted">
                      <span className="tnum">{l.ref}</span> · received {new Date(l.created_at).toLocaleString("en-GB", { timeZone: "Africa/Casablanca", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <a href={waLink(reply, l.phone.replace(/\D/g, ""))} target="_blank" rel="noopener noreferrer" className="min-h-[42px] rounded-full bg-wa px-4 py-2.5 text-sm font-extrabold text-white no-underline">
                    Reply on WhatsApp
                  </a>
                </div>
                <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-[14.5px]">
                  <dt className="text-muted">Dates</dt>
                  <dd className="m-0 font-semibold">{l.arrival ? `${fmtDate(l.arrival)}${l.departure ? ` → ${fmtDate(l.departure)}` : ""}` : "Not set"}</dd>
                  <dt className="text-muted">Guests</dt>
                  <dd className="m-0 font-semibold">{guests}</dd>
                  <dt className="text-muted">Budget</dt>
                  <dd className="m-0 font-semibold">{label(BUDGETS, l.budget) ?? "Not set"}</dd>
                  <dt className="text-muted">Style</dt>
                  <dd className="m-0 font-semibold">{label(STYLES, l.style) ?? "–"}</dd>
                  <dt className="text-muted">Needs</dt>
                  <dd className="m-0 font-semibold">{l.needs.length ? l.needs.map((n) => label(NEEDS, n) ?? n).join(", ") : "–"}</dd>
                  <dt className="text-muted">Contact</dt>
                  <dd className="m-0 font-semibold [overflow-wrap:anywhere]">
                    <span className="tnum select-all">{l.phone}</span>
                    {l.email ? <> · <a href={`mailto:${l.email}`}>{l.email}</a></> : null}
                  </dd>
                  {l.notes ? (
                    <>
                      <dt className="text-muted">Notes</dt>
                      <dd className="m-0 whitespace-pre-wrap">{l.notes}</dd>
                    </>
                  ) : null}
                </dl>
                <form action={setLeadStatus} className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <input type="hidden" name="ref" value={l.ref} />
                  <span className="text-sm font-bold text-muted">Move to</span>
                  {LEAD_STATUSES.filter((s) => s.id !== l.status).map((s) => (
                    <button key={s.id} name="status" value={s.id} className="min-h-[38px] rounded-full border border-line px-3 text-sm font-bold hover:border-ink">
                      {s.label}
                    </button>
                  ))}
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </DispatchShell>
  );
}
