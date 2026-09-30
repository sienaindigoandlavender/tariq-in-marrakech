"use server";

import { revalidatePath } from "next/cache";
import { CITY } from "@/lib/config";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { currentOperator } from "@/lib/supabase/server";

export async function savePartner(_: string, form: FormData): Promise<string> {
  if (!(await currentOperator())) return "Not signed in.";
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const pct = Number(form.get("commission_pct") ?? 10);
  if (!/^[A-Z0-9]{3,12}$/.test(code)) return "Code: 3 to 12 letters or digits, e.g. RDS01.";
  if (name.length < 2) return "Add the riad's name.";
  if (!(pct >= 0 && pct <= 50)) return "Commission must be between 0 and 50%.";
  const { error } = await supabaseAdmin()!.from("partners").upsert({ code, name, commission_pct: pct, city: CITY, active: true });
  if (error) return error.message;
  revalidatePath("/dispatch/partners");
  return `Saved ${code}.`;
}

export async function togglePartner(form: FormData) {
  if (!(await currentOperator())) return;
  const code = String(form.get("code") ?? "");
  const active = form.get("active") === "true";
  await supabaseAdmin()!.from("partners").update({ active: !active }).eq("code", code);
  revalidatePath("/dispatch/partners");
}
