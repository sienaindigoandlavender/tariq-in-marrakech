"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { PublicProduct } from "@/lib/types";
import { useAppState } from "./AppState";
import { ProductCard } from "./ProductCard";

/** Email-only sign in. The link creates the account on first use; no password to forget. */
export function SignInForm({ compact = false }: { compact?: boolean }) {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState(sp.get("error") ? "That link has expired or was already used. Ask for a new one." : "");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMsg("");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/account`, shouldCreateUser: true },
    });
    if (error) {
      setState("error");
      setMsg("We couldn't send a link to that address. Check it and try again.");
    } else setState("sent");
  };

  if (state === "sent")
    return (
      <p className="m-0 rounded-card bg-soft p-4 text-[15px]">
        Check <b>{email}</b> for a sign-in link. Open it on this device and your wishlist follows you.
      </p>
    );

  return (
    <form onSubmit={send} className="grid gap-2.5">
      <label className="grid gap-1.5 text-[13px] font-bold">
        Email
        <div className="flex gap-2 xs:flex-col">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="min-h-[48px] min-w-0 flex-1 rounded-input border border-line bg-bg px-3 font-medium"
          />
          <button disabled={state === "sending"} className="min-h-[48px] whitespace-nowrap rounded-full bg-blue px-5 font-extrabold text-blue-ink disabled:opacity-60">
            {state === "sending" ? "Sending…" : "Email me a link"}
          </button>
        </div>
      </label>
      {!compact ? (
        <p className="m-0 text-[12.5px] text-muted">
          No password. New here? The link creates your free account. We only use your email to sign you in. See our <Link href="/privacy#accounts">privacy policy</Link>.
        </p>
      ) : null}
      {msg ? (
        <p role="alert" className="m-0 text-[13px] font-bold text-warn">
          {msg}
        </p>
      ) : null}
    </form>
  );
}

export function AccountView({ products }: { products: PublicProduct[] }) {
  const { ready, user, accounts, saved, signOut } = useAppState();
  if (!ready) return <div className="min-h-[40vh]" />;
  const list = saved.map((id) => products.find((p) => p.id === id)).filter((p): p is PublicProduct => Boolean(p));

  return (
    <div className="mx-auto grid max-w-[900px] gap-6 py-[26px]">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display m-0 text-[34px]">Your wishlist</h1>
          <p className="m-0 text-sm text-muted">
            {user ? (
              <>
                Signed in as <b className="text-ink">{user.email}</b>. Your list is saved to your account.
              </>
            ) : (
              "Tap the heart on anything to keep it here."
            )}
          </p>
        </div>
        {user ? (
          <button type="button" onClick={() => signOut()} className="min-h-[42px] rounded-full border border-line px-4 text-sm font-extrabold">
            Sign out
          </button>
        ) : null}
      </header>

      {!user ? (
        <section className="grid gap-3 rounded-card border border-line bg-surface p-5">
          <div>
            <h2 className="m-0 text-lg font-extrabold">Create an account or sign in</h2>
            <p className="m-0 mt-0.5 text-sm text-muted">Keep your wishlist on your phone, laptop and your travel partner&rsquo;s tablet.</p>
          </div>
          {accounts ? <SignInForm /> : <p className="m-0 text-sm text-muted">Accounts are not switched on yet. Your wishlist is saved on this device.</p>}
        </section>
      ) : null}

      {list.length ? (
        <div className="grid grid-cols-3 gap-x-[18px] gap-y-6 phone:grid-cols-2 phone:gap-x-3">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} uid={`w-${p.id}`} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 rounded-card bg-soft p-7 text-center text-muted">
          <p className="m-0">Nothing saved yet.</p>
          <div>
            <Link href="/c/all" className="inline-flex min-h-[44px] items-center rounded-full bg-blue px-4 font-extrabold text-blue-ink no-underline">
              Browse everything
            </Link>
          </div>
        </div>
      )}

      <p className="m-0 text-center text-sm text-muted">
        Looking for a booking? It&rsquo;s in <Link href="/trip">My trip</Link>.
      </p>
    </div>
  );
}
