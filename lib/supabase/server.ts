import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "./env";
import { supabaseAdmin } from "./admin";

/** Cookie-bound client for the signed-in operator (Server Components, Route Handlers). */
export function supabaseServer() {
  const store = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the middleware refreshes the session instead.
        }
      },
    },
  });
}

/** Returns the operator's user id, or null if not signed in or not on the allow-list. */
export async function currentOperator(): Promise<{ id: string; email: string | null } | null> {
  if (!hasSupabase) return null;
  const { data } = await supabaseServer().auth.getUser();
  const user = data.user;
  if (!user) return null;
  const admin = supabaseAdmin();
  if (!admin) return null;
  const { data: row } = await admin.from("operators").select("user_id").eq("user_id", user.id).maybeSingle();
  return row ? { id: user.id, email: user.email ?? null } : null;
}
