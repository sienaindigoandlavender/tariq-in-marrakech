"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { STATUS_LABEL, nextStatus } from "@/lib/dispatch";
import type { BookingStatus } from "@/lib/types";

const CHIP: Record<BookingStatus, string> = {
  pending_payment: "bg-line text-muted",
  confirmed: "bg-sun/35 text-ink",
  reminded: "bg-sun/70 text-ink",
  picked: "bg-blue/25 text-ink",
  paid: "bg-ok text-white",
  noshow: "bg-warn/25 text-ink",
  cancelled: "bg-line text-muted",
};

export function StatusControls({
  refCode,
  status: initial,
  prepaid = false,
  refundable = true,
}: {
  refCode: string;
  status: BookingStatus;
  prepaid?: boolean;
  refundable?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();

  const set = async (s: BookingStatus, refund?: boolean) => {
    if (s === status) return;
    const prev = status;
    setStatus(s);
    setErr("");
    const res = await fetch("/api/dispatch/status", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ref: refCode, status: s, refund }) });
    if (!res.ok) {
      setStatus(prev);
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Couldn't update. Tap again.");
    } else start(() => router.refresh());
  };

  const n = nextStatus(status);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => set(n)}
        disabled={pending || status === "cancelled"}
        title={n !== status ? `Tap to mark ${STATUS_LABEL[n]}` : undefined}
        className={`min-h-[36px] whitespace-nowrap rounded-full px-3 text-xs font-extrabold ${CHIP[status]}`}
      >
        {STATUS_LABEL[status]}
        {n !== status ? " →" : ""}
      </button>
      {status !== "noshow" && status !== "paid" && status !== "cancelled" ? (
        <button type="button" onClick={() => set("noshow")} className="min-h-[36px] whitespace-nowrap rounded-full border border-line px-3 text-xs font-bold text-muted">
          No-show
        </button>
      ) : null}
      {(status === "confirmed" || status === "reminded") && prepaid && !refundable ? (
        <>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Guest cancels ${refCode}. Non-refundable: cancel and KEEP the payment?`)) set("cancelled", false);
            }}
            className="min-h-[36px] whitespace-nowrap rounded-full px-2 text-xs font-bold text-warn underline"
          >
            Cancel (no refund)
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`We cancel ${refCode}, or goodwill: refund the guest in full on PayPal?`)) set("cancelled", true);
            }}
            className="min-h-[36px] whitespace-nowrap rounded-full px-2 text-xs font-bold text-muted underline"
          >
            Refund
          </button>
        </>
      ) : status === "confirmed" || status === "reminded" ? (
        <button
          type="button"
          onClick={() => {
            if (window.confirm(prepaid ? `Cancel ${refCode} and refund the guest in full on PayPal?` : `Cancel ${refCode}?`)) set("cancelled");
          }}
          className="min-h-[36px] whitespace-nowrap rounded-full px-2 text-xs font-bold text-warn underline"
        >
          {prepaid ? "Cancel & refund" : "Cancel"}
        </button>
      ) : null}
      {err ? <span role="alert" className="text-xs font-bold text-warn">{err}</span> : null}
    </div>
  );
}
