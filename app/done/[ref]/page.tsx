import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Done } from "@/components/Done";
import { XSELL } from "@/lib/merch";
import { getProducts } from "@/lib/db";
import { REF_RE } from "@/lib/refs";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

export default async function DonePage({ params }: { params: { ref: string } }) {
  if (!REF_RE.test(params.ref)) notFound();
  const all = await getProducts();
  const xsell = XSELL.map((id) => all.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map(({ id, title, price_eur, per }) => ({ id, title, price_eur, per }));
  return (
    <div className="wrap">
      <Suspense>
        <Done refCode={params.ref} xsell={xsell} />
      </Suspense>
    </div>
  );
}
