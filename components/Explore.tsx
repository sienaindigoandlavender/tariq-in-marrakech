import Link from "next/link";
import { copy } from "@/lib/copy";
import type { Category, PublicProduct } from "@/lib/types";
import { AskBar } from "./AskBar";
import { Listing } from "./Listing";
import { PosterScene } from "./PosterScene";
import { FixPrice } from "./FixPrice";
import { FIXES } from "@/lib/merch";
import { ProductCard } from "./ProductCard";
import { RailTrack } from "./RailTrack";


export function Hero() {
  return (
    <section className="relative mt-4 flex min-h-[clamp(300px,40vw,430px)] items-end overflow-hidden rounded-[24px]">
      <PosterScene scene="city" uid="hero" />
      <div className="relative grid w-full grid-cols-[minmax(0,1fr)] gap-3.5 bg-gradient-to-b from-transparent via-[rgb(16_10_30/.6)] to-[rgb(16_10_30/.6)] p-[clamp(18px,4vw,40px)]">
        <h1 className="display m-0 max-w-[14ch] text-balance text-[clamp(38px,6.4vw,78px)] leading-[.92] text-white">
          {copy.hero.h1} <em className="not-italic text-[#ffd27a]">{copy.hero.h1Em}</em>
        </h1>
        <AskBar />
      </div>
    </section>
  );
}

export function Promises() {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 pb-2 pt-4 text-sm font-bold text-muted">
      {copy.promises.map((p) => (
        <li key={p} className="inline-flex items-center gap-2 before:h-2 before:w-2 before:rounded-full before:bg-sun before:content-['']">
          {p}
        </li>
      ))}
    </ul>
  );
}

export function BookSection({ products, initial, heading = copy.book.h }: { products: PublicProduct[]; initial?: "all" | Category; heading?: string }) {
  return (
    <section id="book" className="scroll-mt-20 pb-1.5 pt-[26px]">
      <div className="mb-3.5 flex items-end justify-between gap-3 phone:flex-col phone:items-start phone:gap-1">
        <h2 className="display m-0 text-[34px]">{heading}</h2>
        <p className="m-0 text-sm text-muted">{copy.book.p}</p>
      </div>
      <Listing products={products} initial={initial} />
    </section>
  );
}

export function Solved({ products }: { products: PublicProduct[] }) {
  const fixes = FIXES.map((id) => products.find((p) => p.id === id)).filter(Boolean) as PublicProduct[];
  return (
    <section className="mt-[30px] grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-center gap-[22px] rounded-[24px] bg-soft p-6 phone:grid-cols-1">
      <div>
        <h2 className="display m-0 mb-2 text-[40px] leading-[.95]">{copy.solved.h}</h2>
        <p className="m-0 text-muted">{copy.solved.p}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 tab:grid-cols-2 xs:grid-cols-1">
        {fixes.map((p) => (
          <Link key={p.id} href={`/p/${p.id}`} className="grid gap-1 rounded-[14px] bg-surface p-3.5 no-underline hover:shadow-md">
            <b className="text-[15px]">{p.title}</b>
            <span className="text-[13.5px] text-muted">{p.blurb}</span>
            <FixPrice eur={p.price_eur} per={p.per} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export function How() {
  return (
    <section className="grid grid-cols-3 gap-3.5 pb-2.5 pt-[30px] phone:grid-cols-1">
      {copy.how.map((h) => (
        <div key={h.b} className="border-t-[3px] border-blue pt-3">
          <b className="mb-0.5 block text-base">{h.b}</b>
          <span className="text-[14.5px] text-muted">{h.s}</span>
        </div>
      ))}
    </section>
  );
}

/** OTA-style merchandising rail: 4-up grid on desktop, swipeable row on phone. */
export function Rail({ id, h, p, href, products }: { id: string; h: string; p: string; href: string; products: PublicProduct[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby={`rail-${id}`} className="pt-9">
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={`rail-${id}`} className="display m-0 text-[32px] leading-none phone:text-[28px]">{h}</h2>
          <p className="m-0 mt-1.5 text-[14.5px] text-muted">{p}</p>
        </div>
        <Link href={href} className="flex-none whitespace-nowrap text-sm font-extrabold text-blue no-underline hover:underline">
          {copy.rails.seeAll} →
        </Link>
      </div>
      <RailTrack label={h}>
        {products.map((x) => (
          <div
            key={x.id}
            role="listitem"
            className="w-[calc((100%-54px)/4)] min-w-0 flex-none snap-start tab:w-[calc((100%-36px)/3)] phone:w-[68%] phone:max-w-[260px]"
          >
            <ProductCard p={x} uid={`r-${id}-${x.id}`} />
          </div>
        ))}
      </RailTrack>
    </section>
  );
}

const TILE_SCENE: Record<Category, string> = { exc: "valley", des: "dunes", act: "balloon", trf: "plane", svc: "henna", kit: "nightkit" };

export function CategoryTiles({ counts }: { counts: Record<Category, number> }) {
  const cats = Object.keys(TILE_SCENE) as Category[];
  return (
    <section aria-labelledby="browse-h" className="pt-10">
      <div className="mb-3.5 flex items-end justify-between gap-4">
        <h2 id="browse-h" className="display m-0 text-[32px] leading-none phone:text-[28px]">{copy.rails.browseH}</h2>
        <Link href="/c/all" className="flex-none whitespace-nowrap text-sm font-extrabold text-blue no-underline hover:underline">
          {copy.rails.browseAll} →
        </Link>
      </div>
      <div className="grid grid-cols-6 gap-3 tab:grid-cols-3 xs:grid-cols-2">
        {cats.map((c) => (
          <Link key={c} href={`/c/${c}`} className="group relative block aspect-[4/5] overflow-hidden rounded-card no-underline">
            <PosterScene scene={TILE_SCENE[c]} uid={`tile-${c}`} className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transform-none" />
            <span className="absolute inset-x-0 bottom-0 grid gap-0.5 bg-gradient-to-t from-[rgb(16_10_30/.75)] to-transparent p-3 pt-10 text-white">
              <b className="text-[15px] leading-tight">{copy.categories[c]}</b>
              <span className="text-xs font-semibold opacity-85">{copy.rails.count(counts[c])}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
