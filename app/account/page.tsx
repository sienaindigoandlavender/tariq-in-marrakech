import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/AccountView";
import { getProducts, toPublic } from "@/lib/db";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Your account and wishlist",
  description: "Save trips, transfers and concierge services to your wishlist and find them on any device.",
  robots: { index: false },
};

export default async function AccountPage() {
  const products = (await getProducts()).map(toPublic);
  return (
    <div className="wrap">
      <Suspense>
        <AccountView products={products} />
      </Suspense>
    </div>
  );
}
