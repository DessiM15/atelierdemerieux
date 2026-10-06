"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./cart-provider";

/**
 * The add-to-bag control on a product card.
 *
 * Three honest states, decided from the catalogue rather than guessed:
 *
 * - One buyable variation → "Add to bag" adds it and opens the bag.
 * - Several variations    → "Choose options" goes to the product page, since
 *                           picking a size blind is how returns happen.
 * - Nothing buyable       → "Notify me" goes to the waitlist on the page.
 *
 * It is a sibling of the card's link, never a child of it: a button inside an
 * anchor is invalid HTML and a trap for screen readers.
 */
export function QuickAdd({ product, className = "" }: { product: Product; className?: string }) {
  const { add, openCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const buyable = product.variations.filter(
    (variation) => product.madeToOrder || variation.quantity === null || variation.quantity > 0,
  );
  const base = `btn w-full !min-h-11 !py-2.5 text-[0.6875rem] ${className}`;

  if (buyable.length === 0) {
    return (
      <Link href={`/shop/${product.slug}`} className={`${base} btn-ghost`}>
        Notify me
      </Link>
    );
  }

  if (product.variations.length > 1) {
    return (
      <Link href={`/shop/${product.slug}`} className={`${base} btn-secondary`}>
        Choose options
      </Link>
    );
  }

  const variation = buyable[0]!;

  function onAdd() {
    add({
      variationId: variation.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variationName: variation.name,
      quantity: 1,
      unitPrice: variation.price,
      ...(product.images[0] ? { image: product.images[0] } : {}),
      availability: product.madeToOrder ? "made-to-order" : "ready-to-ship",
      ...(product.leadTime ? { leadTime: product.leadTime } : {}),
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
    openCart();
  }

  return (
    <button type="button" onClick={onAdd} className={`${base} btn-secondary`}>
      {justAdded ? "Added" : "Add to bag"}
      <span className="sr-only"> — {product.name}</span>
    </button>
  );
}
