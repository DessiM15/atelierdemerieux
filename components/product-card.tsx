import Link from "next/link";
import type { Product } from "@/lib/types";
import { availabilityOf, lowestPrice, scarcityNote } from "@/lib/square/catalog";
import { formatMoney } from "@/lib/money";
import { ProductMedia } from "./product-media";

/**
 * A product in a grid.
 *
 * The whole card is one link. Scarcity and lead-time notes sit inside it as
 * plain text rather than as a second interactive element, so the card is a
 * single tab stop and the announcement a screen reader hears is one coherent
 * sentence instead of four fragments.
 */
export function ProductCard({
  product,
  priority = false,
  index = 0,
}: {
  product: Product;
  priority?: boolean;
  index?: number;
}) {
  const price = lowestPrice(product);
  const availability = availabilityOf(product);
  const scarcity = scarcityNote(product);
  const hasVariants = product.variations.length > 1;
  const image = product.images[0];

  return (
    <article className="reveal" data-reveal-delay={index * 70}>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative overflow-hidden bg-parchment">
          <ProductMedia
            image={image}
            productName={product.name}
            decorative
            priority={priority}
            className="
              aspect-[4/5] w-full object-cover
              transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,0.61,0.36,1)]
              group-hover:scale-[1.035]
            "
          />

          {availability === "sold-out" ? (
            <div className="absolute inset-x-0 bottom-0 bg-cream/92 px-4 py-2.5 text-center">
              <span className="eyebrow">Sold — one of a kind</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 pt-4">
          <h3 className="font-display text-[1.1875rem] leading-snug">{product.name}</h3>

          <p className="numeric text-[0.9375rem] text-muted">
            {hasVariants ? <span className="text-[0.8125rem]">From </span> : null}
            {formatMoney(price)}
          </p>

          {/* At most one note per card. Stacking urgency signals is how they
              stop being believed. */}
          {scarcity ? (
            <p className="text-[0.75rem] uppercase tracking-[0.16em] text-rubine">{scarcity}</p>
          ) : availability === "made-to-order" && product.leadTime ? (
            <p className="text-[0.75rem] uppercase tracking-[0.16em] text-boho">
              Made to order · {product.leadTime.minDays}–{product.leadTime.maxDays} days
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
