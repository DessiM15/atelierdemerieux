import type { Money } from "./types";
import { formatMoney, money } from "./money";

/**
 * Shipping policy.
 *
 * Placeholder values pending Sydney's real carrier costs. Everything the site
 * says about shipping — the free-shipping threshold banner, the cart progress
 * line, the checkout total — reads from this one object, so switching to flat
 * rate, free-on-everything, or live carrier rates is a change here and nowhere
 * else.
 */
export const SHIPPING = {
  /** Orders at or above this ship free. Set to null to disable the threshold. */
  freeThreshold: money(15000), // $150
  /** Charged when the order is under the threshold. */
  flatRate: money(800), // $8
  /** Shown on the PDP and in the cart. */
  carrier: "USPS Priority Mail",
  /** Business days in transit once a piece is dispatched. */
  transitDays: { min: 2, max: 5 },
  /** Set true once Sydney confirms she wants local collection. */
  localPickupEnabled: false,
} as const;

export function shippingCostFor(subtotal: Money): Money {
  if (SHIPPING.freeThreshold && subtotal.amount >= SHIPPING.freeThreshold.amount) {
    return money(0, subtotal.currency);
  }
  return SHIPPING.flatRate;
}

/**
 * How much more is needed to qualify for free shipping, or null when the
 * threshold is already met or disabled. Drives the cart's progress line —
 * the single highest-leverage upsell in the whole basket.
 */
export function remainingForFreeShipping(subtotal: Money): Money | null {
  if (!SHIPPING.freeThreshold) return null;
  const remaining = SHIPPING.freeThreshold.amount - subtotal.amount;
  if (remaining <= 0) return null;
  return money(remaining, subtotal.currency);
}

export function freeShippingMessage(subtotal: Money): string {
  const remaining = remainingForFreeShipping(subtotal);
  if (!remaining) return "Your order ships free.";
  return `${formatMoney(remaining)} away from free shipping.`;
}
