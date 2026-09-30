import type { Metadata } from "next";
import { MyTrip } from "@/components/MyTrip";
import { getProducts, toPublic } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = { title: "My trip", robots: { index: false } };

export default async function TripPage() {
  const products = (await getProducts()).map(toPublic);
  return (
    <div className="wrap">
      <MyTrip products={products} />
    </div>
  );
}
