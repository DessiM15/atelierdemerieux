import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProductsByCategory } from "@/lib/square/catalog";
import { ProductCard } from "@/components/product-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) return { title: "Category not found" };

  return {
    title: category.name,
    description:
      category.blurb ?? `${category.name} — handmade crochet from Atelier de Merieux.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <div className="shell pt-12 sm:pt-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.16em] text-muted">
          <li>
            <Link href="/shop" className="underline-offset-4 hover:underline">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">·</li>
          <li>
            <span aria-current="page" className="text-ink">
              {category.name}
            </span>
          </li>
        </ol>
      </nav>

      <header className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-4">The shop</p>
        <h1 className="display-xl">{category.name}</h1>
        <p className="prose-editorial mx-auto mt-6 text-muted">
          {category.blurb ??
            "Handmade crochet, worked one piece at a time. Ready-to-ship pieces leave within a day; made-to-order pieces say so and ship in about three weeks."}
        </p>
      </header>

      <nav aria-label="Categories" className="mt-10">
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <Link
              href="/shop"
              className="inline-block border border-camel px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.18em] transition-colors hover:border-ink"
            >
              Everything
            </Link>
          </li>
          {categories.map((entry) => {
            const current = entry.slug === slug;
            return (
              <li key={entry.id}>
                <Link
                  href={`/shop/category/${entry.slug}`}
                  {...(current ? { "aria-current": "page" as const } : {})}
                  className={`inline-block border px-4 py-2.5 text-[0.75rem] uppercase tracking-[0.18em] transition-colors ${
                    current
                      ? "border-ink bg-ink text-cream"
                      : "border-camel hover:border-ink"
                  }`}
                >
                  {entry.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {products.length === 0 ? (
        <p className="prose-editorial mt-16 text-muted">
          Nothing in this part of the shop right now.{" "}
          <Link href="/shop" className="link">
            See everything
          </Link>
          .
        </p>
      ) : (
        <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index % 3} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
