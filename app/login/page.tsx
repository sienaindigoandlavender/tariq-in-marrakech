import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { hasSupabase } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Operator sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="wrap">
      <div className="mx-auto grid max-w-[420px] gap-4 py-12">
        <h1 className="display m-0 text-[34px]">Dispatch</h1>
        {hasSupabase ? (
          <Suspense>
            <LoginForm />
          </Suspense>
        ) : (
          <p className="m-0 rounded-card bg-soft p-4 text-muted">Supabase is not configured for this deployment yet. Add the Supabase environment variables in Vercel, then redeploy.</p>
        )}
      </div>
    </div>
  );
}
