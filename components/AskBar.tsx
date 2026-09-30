"use client";

import Link from "next/link";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { askTariq } from "./ChatWidget";

export function AskBar() {
  const [q, setQ] = useState("");
  const go = (text: string) => {
    const t = text.trim();
    if (!t) return;
    askTariq(t);
    setQ("");
  };
  return (
    <>
      <form
        className="flex w-full min-w-0 max-w-[620px] gap-2 rounded-full bg-white p-1.5 shadow-[0_8px_30px_rgb(0_0_0/.18)]"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={500}
          aria-label={copy.hero.askBtn}
          placeholder={copy.hero.placeholder}
          className="min-w-0 flex-1 border-0 bg-transparent px-3.5 py-2.5 font-medium text-[#16162a] placeholder:text-[#6b6a7e] focus-visible:outline-none"
        />
        <button type="submit" className="min-h-[44px] whitespace-nowrap rounded-full bg-[#1f3fbf] px-[18px] font-extrabold text-white">
          {copy.hero.askBtn}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {[copy.concierge.suggestions[0], copy.concierge.suggestions[2], copy.concierge.suggestions[1]].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => go(s)}
            className="min-h-[36px] rounded-full border border-white/55 bg-white/15 px-3 text-[13px] font-bold text-white"
          >
            {s}
          </button>
        ))}
        <Link href="/plan" className="inline-flex min-h-[36px] items-center rounded-full bg-[#ffd27a] px-3 text-[13px] font-extrabold text-[#231605] no-underline">
          Plan a whole trip →
        </Link>
      </div>
    </>
  );
}
