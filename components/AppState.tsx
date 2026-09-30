"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAD_RATE } from "@/lib/config";

export type Currency = "EUR" | "MAD";

/** Minimal shape stored on this device for My trip. Extended in the My trip step. */
export type TripItem = { ref: string; id: string; date: string; total: number };

const CUR_KEY = "tq_cur";
const TRIP_KEY = "tariq_trip";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type AppState = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (eur: number) => string;
  trip: TripItem[];
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCur] = useState<Currency>("EUR");
  const [trip, setTrip] = useState<TripItem[]>([]);

  useEffect(() => {
    const c = readJSON<Currency>(CUR_KEY, "EUR");
    if (c === "EUR" || c === "MAD") setCur(c);
    setTrip(readJSON<TripItem[]>(TRIP_KEY, []));
    const onStorage = (e: StorageEvent) => {
      if (e.key === TRIP_KEY) setTrip(readJSON<TripItem[]>(TRIP_KEY, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCur(c);
    try {
      localStorage.setItem(CUR_KEY, JSON.stringify(c));
    } catch {}
  }, []);

  const money = useCallback(
    (eur: number) =>
      currency === "EUR"
        ? "€" + Math.round(eur).toLocaleString("en")
        : Math.round(eur * MAD_RATE).toLocaleString("fr") + " MAD",
    [currency],
  );

  const value = useMemo(() => ({ currency, setCurrency, money, trip }), [currency, setCurrency, money, trip]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}

/** Display a EUR amount in the guest's chosen currency. */
export function Money({ eur, className }: { eur: number; className?: string }) {
  const { money } = useAppState();
  return <span className={`tnum ${className ?? ""}`}>{money(eur)}</span>;
}
