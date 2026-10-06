import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  availabilityOf,
  getProductBySlug,
  getProducts,
  lowestPrice,
} from "@/lib/square/catalog";
import { formatMoney } from "@/lib/money";
import { SHIPPING } from "@/lib/shipping";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ScaleVisualizer } from "@/components/scale-visualizer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Piece not found" };

  const description =
    product.description.slice(0, 155) ||
    `${product.name} — handmade crochet from Atelier de Merieux.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(product.images[0] && !product.images[0].placeholder
        ? { images: [{ url: product.images[0].url, alt: product.images[0].alt }] }
        : {}),
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all
    .filter(
      (entry) =>
        entry.id !== product.id &&
        entry.categoryIds.some((id) => product.categoryIds.includes(id)),
    )
    .slice(0, 3);

  const availability = availabilityOf(product);
  const price = lowestPrice(product);

  /* Product structured data. Helps the listing show a price and stock state in
     search results, which is free qualified traffic for a small shop. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(product.fiber ? { material: product.fiber } : {}),
    brand: { "@type": "Brand", name: "Atelier de Merieux" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: price.currency,
      lowPrice: (price.amount / 100).toFixed(2),
      offerCount: product.variations.length,
      availability:
        availability === "sold-out"
          ? "https://schema.org/SoldOut"
          : availability === "made-to-order"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="shell pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.16em] text-muted">
            <li>
              <Link href="/" className="underline-offset-4 hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <Link href="/shop" className="underline-offset-4 hover:underline">
                Shop
              </Link>
            </li>
            <li aria-hidden="true">·</li>
            <li>
              <span aria-current="page" className="text-ink">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <article className="shell grid gap-10 pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pt-12">
        {/* --- gallery -------------------------------------------------- */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* --- buy box -------------------------------------------------- */}
        <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <header>
            {product.oneOfAKind ? (
              <p className="badge badge-scarce mb-4">One of a kind</p>
            ) : null}
            <h1 className="display-lg">{product.name}</h1>
          </header>

          <AddToCart product={product} />

          {product.description ? (
            <p className="prose-editorial text-muted">{product.description}</p>
          ) : null}

          {/* --- spec block. Cheap to build, and it is the paragraph that
                 makes a $285 blanket believable. ------------------------- */}
          {product.fiber || product.care || product.dimensions ? (
            <dl className="flex flex-col divide-y divide-rule border-y border-rule">
              {product.fiber ? (
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
                  <dt className="eyebrow pt-0.5">Fibre</dt>
                  <dd className="text-[0.9375rem]">{product.fiber}</dd>
                </div>
              ) : null}
              {product.dimensions ? (
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
                  <dt className="eyebrow pt-0.5">Finished size</dt>
                  <dd className="numeric text-[0.9375rem]">
                    {product.dimensions.widthIn} × {product.dimensions.lengthIn} in
                    <span className="sr-only"> ({product.dimensions.label})</span>
                  </dd>
                </div>
              ) : null}
              {product.care ? (
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
                  <dt className="eyebrow pt-0.5">Care</dt>
                  <dd className="text-[0.9375rem]">{product.care}</dd>
                </div>
              ) : null}
              <div className="grid grid-cols-[8rem_1fr] gap-4 py-3.5">
                <dt className="eyebrow pt-0.5">Shipping</dt>
                <dd className="text-[0.9375rem]">
                  {SHIPPING.carrier}, {SHIPPING.transitDays.min}–{SHIPPING.transitDays.max} business
                  days. Free over {formatMoney(SHIPPING.freeThreshold)}.
                </dd>
              </div>
            </dl>
          ) : null}

          {/* Final-sale disclosure sits on the product page, not buried in a
              policy link — a term a buyer only meets after paying is not one
              they agreed to. */}
          <p className="text-[0.8125rem] leading-relaxed text-muted">
            Every piece is made once, by hand, so all sales are final. If anything arrives damaged
            or isn&apos;t what was described, Sydney will make it right —{" "}
            <Link href="/policies/returns" className="link">
              read the full policy
            </Link>
            .
          </p>
        </div>
      </article>

      {/* --- scale ------------------------------------------------------- */}
      {product.dimensions ? (
        <div className="shell mt-16 max-w-3xl sm:mt-20">
          <ScaleVisualizer dimensions={product.dimensions} />
        </div>
      ) : null}

      {/* --- related ----------------------------------------------------- */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="shell mt-20 sm:mt-28">
          <h2 id="related-heading" className="display-md mb-8">
            Worked in the same hand
          </h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry, index) => (
              <ProductCard key={entry.id} product={entry} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
