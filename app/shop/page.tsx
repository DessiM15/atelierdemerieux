import Link from "next/link";
import type { Metadata } from "next";
import { availabilityOf, getCategories, getProducts } from "@/lib/square/catalog";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Every piece currently in the atelier — blankets, throws, and small goods for the home, worked by hand in plum, taupe and cream.",
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  // Available pieces lead. Sold-out ones stay on the page — they still sell the
  // brand and they capture emails — but they sit at the bottom rather than
  // interrupting a row of things somebody can actually buy.
  const sorted = [...products].sort((a, b) => {
    const aGone = availabilityOf(a) === "sold-out" ? 1 : 0;
    const bGone = availabilityOf(b) === "sold-out" ? 1 : 0;
    return aGone - bGone;
  });

  return (
    <div className="shell pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <p className="eyebrow mb-4">The shop</p>
        <h1 className="display-xl">Everything in the atelier</h1>
        <p className="prose-editorial mt-6 text-muted">
          What is here is what exists. Some pieces are on the shelf; others are started the day you
          order them. Both say so on the page.
        </p>
      </header>

      {categories.length > 0 ? (
        <nav aria-label="Categories" className="mt-10">
          <ul className="flex flex-wrap gap-2">
            <li>
              <span
                aria-current="page"
                className="inline-block border border-ink bg-ink px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.18em] text-cream"
              >
                Everything
              </span>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/category/${category.slug}`}
                  className="inline-block border border-camel px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.18em] transition-colors hover:border-ink"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {sorted.length === 0 ? (
        <p className="prose-editorial mt-16 text-muted">
          The shop is being set up. Come back shortly, or{" "}
          <Link href="/commission" className="link">
            commission a piece
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <>
          <p className="sr-only" role="status">
            {sorted.length} {sorted.length === 1 ? "piece" : "pieces"} available.
          </p>
          <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index % 3}
                priority={index < 3}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
