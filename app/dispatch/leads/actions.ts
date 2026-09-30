"use server";

import { revalidatePath } from "next/cache";
import { LEAD_STATUSES } from "@/lib/plan";
import { LEAD_RE } from "@/lib/refs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { currentOperator } from "@/lib/supabase/server";

export async function setLeadStatus(form: FormData) {
  if (!(await currentOperator())) return;
  const ref = String(form.get("ref") ?? "");
  const status = String(form.get("status") ?? "");
  if (!LEAD_RE.test(ref) || !LEAD_STATUSES.some((s) => s.id === status)) return;
  await supabaseAdmin()!.from("leads").update({ status }).eq("ref", ref);
  revalidatePath("/dispatch/leads");
}
