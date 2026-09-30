"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="min-h-[44px] rounded-full bg-blue px-5 font-extrabold text-blue-ink">
      Print card
    </button>
  );
}
