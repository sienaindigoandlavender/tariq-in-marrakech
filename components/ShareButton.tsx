"use client";

import { useState } from "react";

/** Native share sheet on phones; copies the link elsewhere. */
export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);
  const share = async () => {
    const url = location.href.split("?")[0];
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch {}
  };
  return (
    <button type="button" onClick={share} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2 text-sm font-bold text-muted hover:bg-soft hover:text-ink">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" />
      </svg>
      {done ? "Link copied" : "Share"}
    </button>
  );
}
