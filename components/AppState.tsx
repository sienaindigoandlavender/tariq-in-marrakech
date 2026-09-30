"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { hasSupabase } from "@/lib/supabase/env";
import { GBP_RATE, MAD_RATE, USD_RATE } from "@/lib/config";
import { isYmd, tomorrow } from "@/lib/dates";

export type Currency = "EUR" | "MAD" | "USD" | "GBP";
export const CURRENCIES: Currency[] = ["EUR", "USD", "GBP", "MAD"];
/** Currencies shown as a guide only; payment is always in EUR or MAD. */
export const isGuideCurrency = (c: Currency) => c === "USD" || c === "GBP";

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
  payMoney: (eur: number) => string;
  trip: TripItem[];
  addTrip: (t: TripItem) => void;
  updateTrip: (ref: string, patch: Partial<TripItem>) => void;
  removeTrip: (ref: string) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
  /** Signed-in customer (wishlist synced across devices), or null. */
  user: { id: string; email: string | null } | null;
  accounts: boolean;
  signOut: () => Promise<void>;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  last: LastDetails | null;
  setLast: (d: LastDetails) => void;
};

const Ctx = createContext<AppState | null>(null);

export function formatMoney(eur: number, c: Currency): string {
  switch (c) {
    case "MAD":
      return Math.round(eur * MAD_RATE).toLocaleString("fr") + " MAD";
    case "USD":
      return "$" + Math.round(eur * USD_RATE).toLocaleString("en");
    case "GBP":
      return "£" + Math.round(eur * GBP_RATE).toLocaleString("en");
    default:
      return "€" + Math.round(eur).toLocaleString("en");
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currency, setCur] = useState<Currency>("EUR");
  const [trip, setTrip] = useState<TripItem[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [prefs, setPrefsState] = useState<Prefs>({ date: "", guests: 2 });
  const [last, setLastState] = useState<LastDetails | null>(null);
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const userRef = useRef<string | null>(null);

  useEffect(() => {
    const c = readJSON<Currency>(CUR_KEY, "EUR");
    if (CURRENCIES.includes(c)) setCur(c);
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

  const money = useCallback((eur: number) => formatMoney(eur, currency), [currency]);
  /** Amount the guest actually pays: the chosen currency if payable (EUR/MAD), otherwise EUR. */
  const payMoney = useCallback((eur: number) => formatMoney(eur, isGuideCurrency(currency) ? "EUR" : currency), [currency]);

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

  // Wishlist sync. Signed out: this device only. Signed in: merged with the account's list on sign-in,
  // and every heart is written through (RLS limits each customer to their own rows).
  useEffect(() => {
    if (!hasSupabase) return;
    const sb = supabaseBrowser();
    const sync = async (u: { id: string; email?: string | null } | null) => {
      if (!u) {
        userRef.current = null;
        setUser(null);
        return;
      }
      if (userRef.current === u.id) return;
      userRef.current = u.id;
      setUser({ id: u.id, email: u.email ?? null });
      const local = readJSON<string[]>(SAVED_KEY, []);
      const { data } = await sb.from("wishlists").select("product_id").eq("user_id", u.id);
      const remote = (data ?? []).map((r) => r.product_id as string);
      const missing = local.filter((id) => !remote.includes(id));
      if (missing.length) await sb.from("wishlists").upsert(missing.map((product_id) => ({ user_id: u.id, product_id })), { onConflict: "user_id,product_id" });
      const merged = [...new Set([...remote, ...local])];
      writeJSON(SAVED_KEY, merged);
      setSaved(merged);
    };
    sb.auth.getUser().then(({ data }) => sync(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      sync(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const on = prev.includes(id);
      const next = on ? prev.filter((x) => x !== id) : [...prev, id];
      writeJSON(SAVED_KEY, next);
      const uid = userRef.current;
      if (uid && hasSupabase) {
        const t = supabaseBrowser().from("wishlists");
        // Postgrest builders only run when awaited or then'd.
        (on ? t.delete().eq("user_id", uid).eq("product_id", id) : t.upsert({ user_id: uid, product_id: id }, { onConflict: "user_id,product_id" })).then(
          () => undefined,
          () => undefined,
        );
      }
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!hasSupabase) return;
    await supabaseBrowser().auth.signOut();
    userRef.current = null;
    setUser(null);
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
    () => ({ ready, currency, setCurrency, money, payMoney, trip, addTrip, updateTrip, removeTrip, saved, toggleSaved, user, accounts: hasSupabase, signOut, prefs, setPrefs, last, setLast }),
    [ready, currency, setCurrency, money, payMoney, trip, addTrip, updateTrip, removeTrip, saved, toggleSaved, user, signOut, prefs, setPrefs, last, setLast],
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
