import Link from "next/link";
import type { Gate } from "@/lib/operator";

const TABS = [
  { href: "/dispatch", label: "Bookings", key: "bookings" },
  { href: "/dispatch/tomorrow", label: "Tomorrow's pickups", key: "tomorrow" },
  { href: "/dispatch/partners", label: "Partners", key: "partners" },
];

export function DispatchShell({ gate, active, children }: { gate: Gate; active: string; children: React.ReactNode }) {
  return (
    <div className="wrap pb-16 pt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display m-0 text-[34px]">Dispatch</h1>
        {gate.ok || gate.reason === "not_operator" ? (
          <form action="/auth/signout" method="post" className="flex items-center gap-3 text-sm text-muted">
            <span className="hidden sm:inline">{gate.email}</span>
            <button className="min-h-[40px] rounded-full border border-line px-4 font-bold text-ink">Sign out</button>
          </form>
        ) : null}
      </div>
      {gate.ok ? (
        <>
          <nav aria-label="Dispatch" className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                aria-current={t.key === active ? "page" : undefined}
                className={`flex min-h-[40px] flex-none items-center rounded-full border px-4 text-sm font-bold no-underline ${t.key === active ? "border-ink bg-ink text-bg" : "border-line text-muted"}`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          {children}
        </>
      ) : gate.reason === "unconfigured" ? (
        <p className="rounded-card bg-soft p-5 text-muted">
          Supabase isn&apos;t connected yet. Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel, run the migration, then redeploy. Bookings will appear here as they come in.
        </p>
      ) : (
        <p className="rounded-card bg-soft p-5 text-muted">This account isn&apos;t on the operator list. Ask the owner to add your user id to the operators table.</p>
      )}
    </div>
  );
}
