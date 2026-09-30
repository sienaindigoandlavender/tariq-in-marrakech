import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export type LegalSection = { id: string; h: string; body: React.ReactNode };

/** Shared layout for privacy, terms and booking conditions: contents list on the left, text on the right. */
export function LegalPage({ title, intro, sections }: { title: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <div className="wrap pb-10">
      <nav aria-label="Breadcrumb" className="pt-5 text-sm text-muted">
        <Link href="/">Explore</Link> › <span aria-current="page">{title}</span>
      </nav>
      <header className="max-w-[68ch] pb-6 pt-3">
        <h1 className="m-0 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight">{title}</h1>
        <p className="m-0 mt-2 text-sm font-bold text-muted">Last updated {LEGAL.updated}</p>
        <div className="legal mt-4 text-[16px]">{intro}</div>
      </header>
      <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-10 tab:grid-cols-1 tab:gap-4">
        <nav aria-label="Contents" className="tab:rounded-card tab:bg-soft tab:p-4">
          <ol className="sticky top-[86px] m-0 grid list-none gap-1.5 p-0 text-sm tab:static">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="grid grid-cols-[30px_minmax(0,1fr)] font-semibold text-muted no-underline hover:text-ink">
                  <span className="tnum">{i + 1}.</span>
                  <span>{s.h}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="legal min-w-0 max-w-[68ch]">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 border-t border-line py-6 first:border-t-0 first:pt-0">
              <h2 className="m-0 mb-3 text-xl font-extrabold">
                <span className="tnum text-muted">{i + 1}.</span> {s.h}
              </h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Company identity block: only the lines that are configured. */
export function Identity() {
  const rows: [string, string | null][] = [
    ["Company", LEGAL.name],
    ["Registered address", LEGAL.address],
    ["RC", LEGAL.rc],
    ["ICE", LEGAL.ice],
    ["Tourist transport licence", LEGAL.licence],
    ["Email", LEGAL.email],
  ];
  const shown = rows.filter(([, val]) => val);
  if (!shown.length) return null;
  return (
    <dl className="m-0 mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1.5 rounded-card bg-soft p-4 text-[15px]">
      {shown.map(([k, val]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="m-0 font-semibold [overflow-wrap:anywhere]">{val}</dd>
        </div>
      ))}
    </dl>
  );
}
