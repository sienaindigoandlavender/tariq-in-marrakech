"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Subscribes to bookings changes (Supabase Realtime, RLS: operators only) and re-renders the page. */
export function LiveRefresh() {
  const router = useRouter();
  const [live, setLive] = useState<"connecting" | "live" | "offline">("connecting");
  useEffect(() => {
    const sb = supabaseBrowser();
    let t: ReturnType<typeof setTimeout> | undefined;
    const ch = sb
      .channel("bookings-dispatch")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        clearTimeout(t);
        t = setTimeout(() => router.refresh(), 300);
      })
      .subscribe((s) => setLive(s === "SUBSCRIBED" ? "live" : s === "CHANNEL_ERROR" || s === "TIMED_OUT" || s === "CLOSED" ? "offline" : "connecting"));
    return () => {
      clearTimeout(t);
      sb.removeChannel(ch);
    };
  }, [router]);
  return (
    <p className="m-0 inline-flex items-center gap-2 text-sm text-muted" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${live === "live" ? "bg-ok" : live === "offline" ? "bg-warn" : "bg-sun"}`} />
      {live === "live" ? "Live. Updates as bookings come in." : live === "offline" ? "Live updates paused. Reload to reconnect." : "Connecting…"}
    </p>
  );
}
