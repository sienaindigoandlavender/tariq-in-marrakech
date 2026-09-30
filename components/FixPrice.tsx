"use client";

import { copy } from "@/lib/copy";
import { perLabel } from "@/lib/format";
import { useAppState } from "./AppState";

export function FixPrice({ eur, per }: { eur: number; per: string }) {
  const { money } = useAppState();
  return (
    <em className="text-[13.5px] font-extrabold not-italic text-blue">
      {copy.price.from} <span className="tnum">{money(eur)}</span> {perLabel(per)}
    </em>
  );
}
