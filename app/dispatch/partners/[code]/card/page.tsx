import type { Metadata } from "next";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { DispatchShell } from "@/components/dispatch/Shell";
import { PrintButton } from "@/components/dispatch/PrintButton";
import { Logo } from "@/components/Logo";
import { CITY } from "@/lib/config";
import { requireOperator } from "@/lib/operator";
import { SITE_URL } from "@/lib/seo";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "QR card", robots: { index: false } };

export default async function CardPage({ params }: { params: { code: string } }) {
  const gate = await requireOperator(`/dispatch/partners/${params.code}/card`);
  if (!gate.ok) return <DispatchShell gate={gate} active="partners">{null}</DispatchShell>;
  const { data: p } = await supabaseAdmin()!.from("partners").select("code, name").eq("code", params.code.toUpperCase()).eq("city", CITY).maybeSingle();
  if (!p) notFound();
  const url = `${SITE_URL}/r/${p.code}`;
  const svg = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#16162a", light: "#ffffff" } });

  return (
    <div className="wrap py-8">
      <div className="mb-6 flex justify-center print:hidden"><PrintButton /></div>
      <article className="mx-auto grid max-w-[420px] justify-items-center gap-5 rounded-[24px] border-2 border-line bg-white p-8 text-center text-[#16162a] print:border-0">
        <div className="[&_b]:text-[#16162a]"><Logo /></div>
        <p className="m-0 text-sm font-bold uppercase tracking-[.08em] text-[#5a596e]">{p.name}</p>
        <div className="w-[260px] max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="m-0 text-xl font-extrabold leading-snug">Scan to book trips and transfers. Pay on the day.</p>
        <p className="tnum m-0 text-xs text-[#5a596e]">{url.replace(/^https?:\/\//, "")}</p>
      </article>
    </div>
  );
}
