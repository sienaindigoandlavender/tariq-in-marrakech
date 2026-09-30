import { copy } from "@/lib/copy";

// Placeholder: the Explore page is built in step 3.
export default function ExplorePage() {
  return (
    <div className="wrap py-10">
      <h1 className="display text-[clamp(38px,6.4vw,78px)] leading-[.92]">
        {copy.hero.h1} <em className="not-italic text-sun">{copy.hero.h1Em}</em>
      </h1>
      <div className="flex flex-wrap gap-x-6 gap-y-2.5 pb-2 pt-4 text-sm font-bold text-muted">
        {copy.promises.map((p) => (
          <span key={p} className="inline-flex items-center gap-2 before:h-2 before:w-2 before:rounded-full before:bg-sun before:content-['']">
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
