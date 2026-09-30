import type { Metadata } from "next";
import { Suspense } from "react";
import { Concierge } from "@/components/Concierge";
import { getProducts } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Ask Tariq, your Marrakech concierge",
  description: "Tell us your dates and who's travelling. Tariq suggests transfers, trips and fixes you can book in a minute and pay on the day.",
};

export default async function ConciergePage() {
  const products = (await getProducts()).map(({ id, title, price_eur, per, scene, image_url }) => ({ id, title, price_eur, per, scene, image_url }));
  return (
    <div className="wrap">
      <Suspense>
        <Concierge products={products} />
      </Suspense>
    </div>
  );
}
