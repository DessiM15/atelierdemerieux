"use client";

import { useId, useMemo, useState } from "react";
import type { Product, ProductVariation } from "@/lib/types";
import { formatMoney, installment } from "@/lib/money";
import { useCart } from "./cart-provider";
import { WaitlistForm } from "./waitlist-form";

/**
 * The buy box.
 *
 * The only interactive island on the product page — everything else is server
 * rendered. Variations are a real radio group rather than a styled `<select>`
 * or a row of buttons, so arrow keys move between options, the group has one
 * tab stop, and the selected state is announced without any ARIA of our own.
 */
export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const groupId = useId();

  const [variationId, setVariationId] = useState(() => {
    // Open on the first option that can actually be bought.
    const buyable = product.variations.find((variation) => isBuyable(product, variation));
    return (buyable ?? product.variations[0]!).id;
  });
  const [quantity, setQuantity] = useState(1);

  const variation = useMemo(
    () => product.variations.find((entry) => entry.id === variationId) ?? product.variations[0]!,
    [product.variations, variationId],
  );

  const buyable = isBuyable(product, variation);
  const stock = variation.quantity;
  const maxQuantity = product.madeToOrder || stock === null ? 10 : Math.max(1, stock);
  const hasOptions = product.variations.length > 1;

  function onAdd() {
    add({
      variationId: variation.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variationName: variation.name,
      quantity,
      unitPrice: variation.price,
      ...(product.images[0] ? { image: product.images[0] } : {}),
      availability: product.madeToOrder ? "made-to-order" : "ready-to-ship",
      ...(product.leadTime ? { leadTime: product.leadTime } : {}),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* --- price ------------------------------------------------------ */}
      <div>
        <p className="numeric font-display text-[1.75rem] leading-none">
          {formatMoney(variation.price)}
        </p>
        {variation.price.amount >= 5000 ? (
          <p className="mt-2 text-[0.8125rem] text-muted">
            or 4 payments of {formatMoney(installment(variation.price))} with Afterpay
          </p>
        ) : null}
      </div>

      {/* --- variations ------------------------------------------------- */}
      {hasOptions ? (
        <fieldset>
          <legend className="field-label">
            {inferOptionLabel(product.variations)}
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={groupId}>
            {product.variations.map((entry) => {
              const available = isBuyable(product, entry);
              const selected = entry.id === variationId;
              return (
                <label
                  key={entry.id}
                  className={`
                    relative cursor-pointer border px-4 py-3 text-[0.875rem] transition-colors
                    ${selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"}
                    ${available ? "" : "cursor-not-allowed text-muted line-through opacity-60"}
                  `}
                >
                  <input
                    type="radio"
                    name={`variation-${product.id}`}
                    value={entry.id}
                    checked={selected}
                    disabled={!available}
                    onChange={() => {
                      setVariationId(entry.id);
                      setQuantity(1);
                    }}
                    className="sr-only"
                  />
                  {entry.name}
                  {!available ? <span className="sr-only"> — sold out</span> : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {/* --- availability ----------------------------------------------- */}
      <AvailabilityNote product={product} variation={variation} />

      {/* --- quantity + add --------------------------------------------- */}
      {buyable ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-stretch gap-3">
            <div className="flex items-center border border-camel">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                className="flex size-12 items-center justify-center disabled:opacity-40"
              >
                <span aria-hidden="true">−</span>
                <span className="sr-only">Decrease quantity</span>
              </button>
              <span className="numeric w-10 text-center">
                <span className="sr-only">Quantity: </span>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                disabled={quantity >= maxQuantity}
                className="flex size-12 items-center justify-center disabled:opacity-40"
              >
                <span aria-hidden="true">+</span>
                <span className="sr-only">Increase quantity</span>
              </button>
            </div>

            <button type="button" onClick={onAdd} className="btn btn-primary flex-1">
              Add to bag
            </button>
          </div>

          {!product.madeToOrder && stock !== null && stock <= 3 ? (
            <p className="text-[0.8125rem] text-rubine">
              {stock === 1 ? "This is the last one." : `Only ${stock} left.`}
            </p>
          ) : null}
        </div>
      ) : (
        <WaitlistForm productId={product.id} productName={product.name} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Availability
   --------------------------------------------------------------------------- */

function AvailabilityNote({
  product,
  variation,
}: {
  product: Product;
  variation: ProductVariation;
}) {
  if (product.madeToOrder) {
    const lead = product.leadTime;
    return (
      <div className="border-l-2 border-boho pl-4">
        <p className="eyebrow mb-1.5">Made to order</p>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          {lead ? (
            <>
              Sydney starts this piece when you order it. Expect{" "}
              <strong className="font-medium text-ink">
                {lead.minDays}–{lead.maxDays} days
              </strong>{" "}
              at the hook before it ships.
            </>
          ) : (
            "Sydney starts this piece when you order it. She'll confirm a ship date by email within one business day."
          )}
        </p>
      </div>
    );
  }

  if (variation.quantity === 0) {
    return (
      <div className="border-l-2 border-camel pl-4">
        <p className="eyebrow mb-1.5">
          {product.oneOfAKind ? "Sold — one of a kind" : "Sold out"}
        </p>
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          {product.oneOfAKind
            ? "This one has gone and there isn't another. Sydney can make something close — leave your email, or commission a piece."
            : "Not in stock right now. Leave your email and we'll write the moment it's back."}
        </p>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-rubine pl-4">
      <p className="eyebrow mb-1.5">Ready to ship</p>
      <p className="text-[0.9375rem] leading-relaxed text-muted">
        In the studio now. Orders placed before noon go out the same business day.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */

function isBuyable(product: Product, variation: ProductVariation): boolean {
  if (product.madeToOrder) return true;
  if (variation.quantity === null) return true;
  return variation.quantity > 0;
}

/**
 * Square variation names carry the option in them ("Throw · 50 × 60 in",
 * "18 × 18 in · Plum"). Rather than demand a rigid naming scheme from Sydney,
 * infer a sensible group label and fall back to something neutral.
 */
function inferOptionLabel(variations: ProductVariation[]): string {
  const names = variations.map((variation) => variation.name.toLowerCase());
  if (names.some((name) => /\d\s*(in|")|×|x\s*\d/.test(name))) return "Size";
  if (names.some((name) => /plum|cream|taupe|camel|natural|wine/.test(name))) return "Colour";
  return "Option";
}
