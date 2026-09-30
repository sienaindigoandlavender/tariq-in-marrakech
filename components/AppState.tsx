"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAD_RATE } from "@/lib/config";
import { isYmd, tomorrow } from "@/lib/dates";

export type Currency = "EUR" | "MAD";

/** A booking remembered on this device for My trip. */
export type TripItem = {
  ref: string;
  id: string;
  title: string;
  scene: string;
  image_url: string | null;
  date: string;
  guests: number;
  mode: "shared" | "private";
  extras: string[];
  pickup: string;
  lead_name: string;
  phone: string;
  notes: string | null;
  lines: { kind: "base" | "private" | "addon"; label: string; qty: number; unit_eur: number; eur: number }[];
  total: number;
  persisted: boolean;
  /** on_arrival | paypal (awaiting capture) | paid (captured online) */
  payment?: "on_arrival" | "paypal" | "paid";
};

export type Prefs = { date: string; guests: number };
export type LastDetails = { pickup: string; name: string; phone: string };

const CUR_KEY = "tq_cur";
const TRIP_KEY = "tariq_trip";
const SAVED_KEY = "tq_saved";
const LAST_KEY = "tq_last";
const PREFS_COOKIE = "tq_prefs";

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

function readPrefsCookie(): Prefs | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${PREFS_COOKIE}=([^;]*)`));
    if (!m) return null;
    const v = JSON.parse(decodeURIComponent(m[1]));
    const guests = Math.min(14, Math.max(1, Number(v.guests) || 2));
    const date = isYmd(v.date) && v.date >= tomorrow() ? v.date : tomorrow();
    return { date, guests };
  } catch {
    return null;
  }
}

type AppState = {
  ready: boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (eur: number) => string;
  trip: TripItem[];
  addTrip: (t: TripItem) => void;
  updateTrip: (ref: string, patch: Partial<TripItem>) => void;
  removeTrip: (ref: string) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  last: LastDetails | null;
  setLast: (d: LastDetails) => void;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currency, setCur] = useState<Currency>("EUR");
  const [trip, setTrip] = useState<TripItem[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [prefs, setPrefsState] = useState<Prefs>({ date: "", guests: 2 });
  const [last, setLastState] = useState<LastDetails | null>(null);

  useEffect(() => {
    const c = readJSON<Currency>(CUR_KEY, "EUR");
    if (c === "EUR" || c === "MAD") setCur(c);
    setTrip(readJSON<TripItem[]>(TRIP_KEY, []).filter((t) => t && t.ref && t.id));
    setSaved(readJSON<string[]>(SAVED_KEY, []));
    setLastState(readJSON<LastDetails | null>(LAST_KEY, null));
    setPrefsState(readPrefsCookie() ?? { date: tomorrow(), guests: 2 });
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TRIP_KEY) setTrip(readJSON<TripItem[]>(TRIP_KEY, []));
      if (e.key === SAVED_KEY) setSaved(readJSON<string[]>(SAVED_KEY, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCur(c);
    writeJSON(CUR_KEY, c);
  }, []);

  const money = useCallback(
    (eur: number) =>
      currency === "EUR"
        ? "€" + Math.round(eur).toLocaleString("en")
        : Math.round(eur * MAD_RATE).toLocaleString("fr") + " MAD",
    [currency],
  );

  const addTrip = useCallback((t: TripItem) => {
    setTrip((prev) => {
      const next = [...prev.filter((x) => x.ref !== t.ref), t];
      writeJSON(TRIP_KEY, next);
      return next;
    });
  }, []);

  const updateTrip = useCallback((ref: string, patch: Partial<TripItem>) => {
    setTrip((prev) => {
      const next = prev.map((t) => (t.ref === ref ? { ...t, ...patch } : t));
      writeJSON(TRIP_KEY, next);
      return next;
    });
  }, []);

  const removeTrip = useCallback((ref: string) => {
    setTrip((prev) => {
      const next = prev.filter((t) => t.ref !== ref);
      writeJSON(TRIP_KEY, next);
      return next;
    });
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeJSON(SAVED_KEY, next);
      return next;
    });
  }, []);

  const setPrefs = useCallback((p: Partial<Prefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...p };
      document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      return next;
    });
  }, []);

  const setLast = useCallback((d: LastDetails) => {
    setLastState(d);
    writeJSON(LAST_KEY, d);
  }, []);

  const value = useMemo(
    () => ({ ready, currency, setCurrency, money, trip, addTrip, updateTrip, removeTrip, saved, toggleSaved, prefs, setPrefs, last, setLast }),
    [ready, currency, setCurrency, money, trip, addTrip, updateTrip, removeTrip, saved, toggleSaved, prefs, setPrefs, last, setLast],
  );
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
