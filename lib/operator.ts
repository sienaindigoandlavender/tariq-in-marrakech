import "server-only";
import { redirect } from "next/navigation";
import { hasSupabase } from "./supabase/env";
import { supabaseAdmin } from "./supabase/admin";
import { currentOperator, supabaseServer } from "./supabase/server";

export type Gate =
  | { ok: true; email: string | null }
  | { ok: false; reason: "unconfigured" | "not_operator"; email?: string | null };

/** Server-side guard for every /dispatch page. Redirects to /login when signed out. */
export async function requireOperator(next: string): Promise<Gate> {
  if (!hasSupabase || !supabaseAdmin()) return { ok: false, reason: "unconfigured" };
  const op = await currentOperator();
  if (op) return { ok: true, email: op.email };
  const { data } = await supabaseServer().auth.getUser();
  if (!data.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { ok: false, reason: "not_operator", email: data.user.email };
}
