"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { OrderSummary } from "@/lib/types";
import { formatMoney } from "@/lib/money";
import { StitchGlyph } from "../wordmark";

/**
 * Order confirmation.
 *
 * Reads the summary the checkout stashed in sessionStorage rather than taking
 * an order id from the URL — an order id in a query string is guessable,
 * shareable and ends up in server logs and analytics. If the stash is gone (a
 * new tab, a cleared session) the page still confirms the order succeeded and
 * points at the emailed receipt, instead of showing an error for something
 * that worked.
 */
export function ConfirmationDetails() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loaded, setLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("adm.lastOrder");
      if (raw) setOrder(JSON.parse(raw) as OrderSummary);
    } catch {
      // Nothing to show; the fallback copy covers it.
    }
    setLoaded(true);
  }, []);

  // Move focus to the confirmation so a screen-reader user lands on the
  // outcome rather than at the top of a freshly swapped page.
  useEffect(() => {
    if (loaded) headingRef.current?.focus();
  }, [loaded]);

  return (
    <div className="flex flex-col gap-8">
      <StitchGlyph className="h-7 w-auto text-rubine" loops={4} />

      <header>
        <p className="eyebrow mb-3">Order confirmed</p>
        <h1 ref={headingRef} tabIndex={-1} className="display-lg">
          Thank you — it&apos;s in Sydney&apos;s hands.
        </h1>
      </header>

      {!loaded ? (
        <p className="prose-editorial text-muted">Fetching your order…</p>
      ) : order ? (
        <>
          <p className="prose-editorial text-muted">
            A receipt is on its way to{" "}
            <strong className="font-medium text-ink">{order.email}</strong>. Sydney will write again
            the moment your piece ships.
          </p>

          <dl className="flex flex-col divide-y divide-rule border-y border-rule">
            <Row label="Order" value={order.orderId} mono />
            {order.receiptNumber ? <Row label="Receipt" value={order.receiptNumber} mono /> : null}
            <Row label="Subtotal" value={formatMoney(order.subtotal)} />
            <Row
              label="Shipping"
              value={order.shipping.amount === 0 ? "Free" : formatMoney(order.shipping)}
            />
            {order.tax.amount > 0 ? <Row label="Tax" value={formatMoney(order.tax)} /> : null}
            <Row label="Total paid" value={formatMoney(order.total)} emphasis />
          </dl>

          {order.receiptUrl ? (
            <a
              href={order.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link self-start text-[0.9375rem]"
            >
              View your Square receipt
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
        </>
      ) : (
        <p className="prose-editorial text-muted">
          Your payment went through. The receipt is in your inbox — check there for the order
          number. If it hasn&apos;t arrived in a few minutes, look in spam, then write to us.
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/shop" className="btn btn-secondary">
          Keep looking
        </Link>
        <Link href="/custom-order" className="btn btn-ghost">
          Start a custom order
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
  emphasis = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 py-3.5">
      <dt className="eyebrow pt-0.5">{label}</dt>
      <dd
        className={`${mono ? "numeric break-all text-[0.8125rem]" : "text-[0.9375rem]"} ${
          emphasis ? "font-display text-lg" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
