import { BookSection, Hero, How, Promises, Solved } from "@/components/Explore";
import { getProducts, recommended, toPublic } from "@/lib/db";

export const revalidate = 300;

export default async function ExplorePage() {
  const products = recommended(await getProducts()).map(toPublic);
  return (
    <div className="wrap">
      <Hero />
      <Promises />
      <BookSection products={products} />
      <Solved products={products} />
      <How />
    </div>
  );
}
