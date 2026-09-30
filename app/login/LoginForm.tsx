"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm() {
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState(sp.get("error") ? "That sign-in link has expired or was already used. Ask for a new one." : "");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMsg("");
    const next = sp.get("next")?.startsWith("/dispatch") ? sp.get("next")! : "/dispatch";
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`, shouldCreateUser: false },
    });
    if (error) {
      setState("error");
      setMsg("We couldn't send a link to that address. Operators must be invited first.");
    } else setState("sent");
  };

  if (state === "sent") return <p className="m-0 rounded-card bg-soft p-4">Check your email for a sign-in link. You can close this tab.</p>;

  return (
    <form onSubmit={send} className="grid gap-3">
      <p className="m-0 text-muted">{"Operators only. We'll email you a sign-in link."}</p>
      <label className="grid gap-1.5 text-[13px] font-bold">
        Email
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-[46px] rounded-input border border-line bg-bg px-3 font-medium" />
      </label>
      <button disabled={state === "sending"} className="min-h-[50px] rounded-full bg-blue font-extrabold text-blue-ink disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Email me a link"}
      </button>
      {msg ? <p role="alert" className="m-0 text-[13px] font-bold text-warn">{msg}</p> : null}
    </form>
  );
}
