import type { Money } from "./types";

/**
 * Money is handled in minor units everywhere — Square's convention and the
 * only way to avoid float drift on a total. Nothing in this app ever stores a
 * price as a decimal number.
 */

export const ZERO: Money = { amount: 0, currency: "USD" };

export function money(amount: number, currency = "USD"): Money {
  return { amount: Math.round(amount), currency };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiply(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency };
}

export function sum(items: Money[], currency = "USD"): Money {
  if (items.length === 0) return { amount: 0, currency };
  return items.reduce((acc, item) => add(acc, item), { amount: 0, currency: items[0]!.currency });
}

export function isZero(m: Money): boolean {
  return m.amount === 0;
}

export function gte(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return a.amount >= b.amount;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot combine ${a.currency} with ${b.currency}`);
  }
}

/**
 * Formats for display. Whole-dollar amounts drop the decimals — "$185" reads
 * as considered where "$185.00" reads as a receipt, and this is a storefront
 * where the price is part of the typography.
 */
export function formatMoney(m: Money, options: { alwaysCents?: boolean } = {}): string {
  const showCents = options.alwaysCents || m.amount % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(m.amount / 100);
}

/**
 * Screen-reader friendly price. `$185` is announced as "one hundred eighty
 * five dollars" by most engines, but currency symbols are inconsistently
 * voiced across NVDA/JAWS/VoiceOver, so anywhere a price is decorative-adjacent
 * we pair the visual string with this one in a visually-hidden span.
 */
export function formatMoneyForScreenReader(m: Money): string {
  const dollars = Math.floor(m.amount / 100);
  const cents = m.amount % 100;
  const unit = m.currency === "USD" ? "dollars" : m.currency;
  if (cents === 0) return `${dollars} ${unit}`;
  return `${dollars} ${unit} and ${cents} cents`;
}

/** "4 payments of $46.25" — the Afterpay line. */
export function installment(m: Money, parts = 4): Money {
  return { amount: Math.round(m.amount / parts), currency: m.currency };
}
