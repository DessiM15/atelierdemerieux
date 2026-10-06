"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./cart-provider";
import { ProductMedia } from "./product-media";
import { formatMoney, multiply } from "@/lib/money";
import { freeShippingMessage, remainingForFreeShipping } from "@/lib/shipping";

/**
 * The bag.
 *
 * Built on the native `<dialog>` element, which gives focus trapping, Escape
 * to close, inert background content and return-focus behaviour from the
 * platform rather than from several hundred lines of hand-rolled focus
 * management that would drift out of correctness.
 */
export function CartDrawer() {
  const { lines, isOpen, closeCart, setQuantity, remove, subtotal, itemCount } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      // Stop the page behind from scrolling while the bag is open.
      document.body.style.overflow = "hidden";
    } else if (!isOpen && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // The dialog can close itself (Escape, backdrop) — keep React in step.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => closeCart();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [closeCart]);

  const remaining = remainingForFreeShipping(subtotal);
  const progress = remaining
    ? Math.min(100, Math.round((subtotal.amount / (subtotal.amount + remaining.amount)) * 100))
    : 100;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-heading"
      className="
        m-0 ml-auto h-dvh max-h-dvh w-full max-w-[30rem] bg-cream p-0 text-ink
        backdrop:bg-roast/40 backdrop:backdrop-blur-[1px]
      "
      onClick={(event) => {
        // Click on the backdrop (the dialog element itself, outside the panel).
        if (event.target === dialogRef.current) closeCart();
      }}
    >
      <div className="flex h-full flex-col">
        {/* --- head --------------------------------------------------- */}
        <div className="flex items-center justify-between border-b border-rule px-6 py-5">
          <h2 id="cart-heading" className="tracked text-[0.8125rem]">
            Your Bag
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="-mr-2 flex size-11 items-center justify-center"
          >
            <span className="sr-only">Close bag</span>
            <svg
              viewBox="0 0 16 16"
              className="w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              aria-hidden="true"
              focusable="false"
            >
              <line x1="2" y1="2" x2="14" y2="14" />
              <line x1="14" y1="2" x2="2" y2="14" />
            </svg>
          </button>
        </div>

        {/* --- free shipping progress --------------------------------- */}
        {itemCount > 0 ? (
          <div className="border-b border-rule px-6 py-4">
            <p className="text-[0.8125rem] text-muted">{freeShippingMessage(subtotal)}</p>
            <div
              className="mt-2.5 h-px w-full bg-linen"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress toward free shipping"
            >
              <div
                className="h-px bg-rubine transition-[width] duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {/* --- lines -------------------------------------------------- */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center">
              <p className="font-display text-2xl">Your bag is empty.</p>
              <p className="max-w-[28ch] text-[0.9375rem] text-muted">
                Every piece is worked by hand, one at a time. Start with the throws.
              </p>
              <Link href="/shop" className="btn btn-secondary mt-1" onClick={closeCart}>
                Shop the atelier
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {lines.map((line) => (
                <li key={line.variationId} className="flex gap-4 px-6 py-5">
                  <Link
                    href={`/shop/${line.slug}`}
                    onClick={closeCart}
                    className="block w-20 shrink-0 overflow-hidden bg-parchment"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProductMedia
                      image={line.image}
                      productName={line.name}
                      decorative
                      className="aspect-[4/5] w-full object-cover"
                      sizes="80px"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={`/shop/${line.slug}`}
                      onClick={closeCart}
                      className="font-display text-[1.0625rem] leading-snug"
                    >
                      {line.name}
                    </Link>
                    {line.variationName !== "Standard" ? (
                      <p className="text-[0.8125rem] text-muted">{line.variationName}</p>
                    ) : null}
                    {line.availability === "made-to-order" && line.leadTime ? (
                      <p className="text-[0.75rem] text-boho">
                        Made to order · ships in {line.leadTime.minDays}–{line.leadTime.maxDays} days
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        label={line.name}
                        onChange={(next) => setQuantity(line.variationId, next)}
                      />
                      <p className="numeric text-[0.9375rem]">
                        {formatMoney(multiply(line.unitPrice, line.quantity))}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(line.variationId)}
                      className="mt-1 self-start text-[0.75rem] text-muted underline underline-offset-4"
                    >
                      Remove<span className="sr-only"> {line.name} from your bag</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- foot --------------------------------------------------- */}
        {lines.length > 0 ? (
          <div className="border-t border-rule px-6 py-5">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Subtotal</span>
              <span className="numeric font-display text-xl">{formatMoney(subtotal)}</span>
            </div>
            <p className="mt-1.5 text-[0.75rem] text-muted">
              Tax calculated at checkout. Every piece is made once, by hand —{" "}
              <Link href="/policies/returns" className="link" onClick={closeCart}>
                all sales are final
              </Link>
              .
            </p>
            <Link href="/checkout" className="btn btn-primary mt-4 w-full" onClick={closeCart}>
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full text-[0.75rem] uppercase tracking-[0.18em] text-muted"
            >
              Keep looking
            </button>
          </div>
        ) : null}
      </div>
    </dialog>
  );
}

/* ---------------------------------------------------------------------------
   Quantity stepper
   --------------------------------------------------------------------------- */

function QuantityStepper({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center border border-linen">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="flex size-9 items-center justify-center text-base leading-none"
      >
        <span aria-hidden="true">−</span>
        <span className="sr-only">Decrease quantity of {label}</span>
      </button>
      <span className="numeric w-8 text-center text-[0.875rem]" aria-live="polite">
        <span className="sr-only">Quantity: </span>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex size-9 items-center justify-center text-base leading-none"
      >
        <span aria-hidden="true">+</span>
        <span className="sr-only">Increase quantity of {label}</span>
      </button>
    </div>
  );
}
