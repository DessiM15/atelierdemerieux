"use client";

import Link from "next/link";
import { useCart } from "../cart-provider";
import { ProductMedia } from "../product-media";
import { formatMoney, multiply } from "@/lib/money";
import { SHIPPING, shippingCostFor } from "@/lib/shipping";

/**
 * The order recap beside the checkout form.
 *
 * Carries the lead-time disclosure for made-to-order lines. A buyer must meet
 * the ship window before they pay, not in the confirmation email — both
 * because it is the honest thing and because an undisclosed three-week wait is
 * how a chargeback starts.
 */
export function CheckoutSummary() {
  const { lines, subtotal, ready } = useCart();

  if (!ready) {
    return <p className="text-[0.9375rem] text-muted">Loading your bag…</p>;
  }

  if (lines.length === 0) {
    return (
      <p className="text-[0.9375rem] text-muted">
        Your bag is empty.{" "}
        <Link href="/shop" className="link">
          Find something
        </Link>
        .
      </p>
    );
  }

  const shippingCost = shippingCostFor(subtotal);
  const madeToOrder = lines.filter((line) => line.availability === "made-to-order");
  const longestLead = madeToOrder.reduce(
    (longest, line) => Math.max(longest, line.leadTime?.maxDays ?? 0),
    0,
  );

  return (
    <div className="border border-rule">
      <ul className="divide-y divide-rule">
        {lines.map((line) => (
          <li key={line.variationId} className="flex gap-4 p-4">
            <div className="w-16 shrink-0 bg-parchment">
              <ProductMedia
                image={line.image}
                productName={line.name}
                decorative
                sizes="64px"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="font-display text-[1rem] leading-snug">{line.name}</p>
              {line.variationName !== "Standard" ? (
                <p className="text-[0.8125rem] text-muted">{line.variationName}</p>
              ) : null}
              <p className="numeric text-[0.8125rem] text-muted">
                Quantity {line.quantity}
              </p>
            </div>
            <p className="numeric text-[0.9375rem]">
              {formatMoney(multiply(line.unitPrice, line.quantity))}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-rule p-4">
        <dl className="flex flex-col gap-2">
          <div className="flex justify-between">
            <dt className="text-[0.875rem] text-muted">Subtotal</dt>
            <dd className="numeric text-[0.875rem]">{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[0.875rem] text-muted">Shipping</dt>
            <dd className="numeric text-[0.875rem]">
              {shippingCost.amount === 0 ? "Free" : formatMoney(shippingCost)}
            </dd>
          </div>
        </dl>
      </div>

      {longestLead > 0 ? (
        <div className="border-t border-rule bg-parchment p-4">
          <p className="eyebrow mb-1.5">Made to order</p>
          <p className="text-[0.875rem] leading-relaxed text-muted">
            {madeToOrder.length === 1
              ? `${madeToOrder[0]!.name} is started once you order.`
              : `${madeToOrder.length} pieces in this order are started once you order.`}{" "}
            Expect up to <strong className="font-medium text-ink">{longestLead} days</strong> at the
            hook, then {SHIPPING.transitDays.min}–{SHIPPING.transitDays.max} business days in
            transit. Sydney emails you when it ships.
          </p>
        </div>
      ) : null}
    </div>
  );
}
