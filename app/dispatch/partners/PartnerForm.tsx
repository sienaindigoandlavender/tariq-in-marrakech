"use client";

import { useFormState, useFormStatus } from "react-dom";
import { savePartner } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="min-h-[44px] rounded-full bg-blue px-5 font-extrabold text-blue-ink disabled:opacity-60">{pending ? "Saving…" : "Save partner"}</button>;
}

export function PartnerForm() {
  const [msg, action] = useFormState(savePartner, "");
  const f = "min-h-[44px] w-full rounded-input border border-line bg-bg px-3 font-medium";
  return (
    <form action={action} className="grid grid-cols-[120px_minmax(0,1fr)_110px_auto] items-end gap-3 rounded-card bg-soft p-3 phone:grid-cols-2">
      <label className="grid gap-1 text-[13px] font-bold">Code<input name="code" required placeholder="RDS01" className={f} /></label>
      <label className="grid gap-1 text-[13px] font-bold phone:col-span-2 phone:row-start-2">Riad name<input name="name" required className={f} /></label>
      <label className="grid gap-1 text-[13px] font-bold">Commission %<input name="commission_pct" type="number" min={0} max={50} step="0.5" defaultValue={10} className={f} /></label>
      <div className="phone:col-span-2"><Submit /></div>
      {msg ? <p role="status" className="col-span-full m-0 text-sm font-bold">{msg}</p> : null}
    </form>
  );
}
