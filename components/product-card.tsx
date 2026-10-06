import Link from "next/link";
import type { Product } from "@/lib/types";
import { availabilityOf, lowestPrice, scarcityNote } from "@/lib/square/catalog";
import { formatMoney } from "@/lib/money";
import { ProductMedia } from "./product-media";
import { QuickAdd } from "./quick-add";

/**
 * A product in a grid.
 *
 * The photograph and the name are both links to the product page; the
 * add-to-bag control is a separate sibling so the card contains no nested
 * interactive elements. Scarcity and lead-time notes are plain text.
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
  const href = `/shop/${product.slug}`;

  return (
    <article className="reveal flex flex-col" data-reveal-delay={index * 70}>
      <Link href={href} className="group block" tabIndex={-1} aria-hidden="true">
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
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 pt-4">
        <h3 className="font-display text-[1.1875rem] leading-snug">
          <Link href={href} className="hover:text-rubine">
            {product.name}
          </Link>
        </h3>

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
        ) : (
          <p className="text-[0.75rem] uppercase tracking-[0.16em] text-boho">Ready to ship</p>
        )}

        <QuickAdd product={product} className="mt-3" />
      </div>
    </article>
  );
}
