import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Checkout } from "@/components/Checkout";
import { getProduct, getProducts, toPublic } from "@/lib/db";
import { paypalEnabled } from "@/lib/paypal";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProduct(params.id);
  return p ? { title: `Book: ${p.title}`, robots: { index: false } } : {};
}

export default async function BookPage({ params }: { params: { id: string } }) {
  const p = await getProduct(params.id);
  if (!p) notFound();
  return (
    <div className="wrap">
      <Suspense>
        <Checkout p={toPublic(p)} payNowAvailable={paypalEnabled() && supabaseAdmin() !== null} />
      </Suspense>
    </div>
  );
}
