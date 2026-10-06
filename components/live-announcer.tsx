"use client";

import { useCart } from "./cart-provider";

/**
 * A single polite live region for cart changes.
 *
 * It is rendered once, at the root, and always present in the DOM — regions
 * that are inserted at the same moment their text appears are frequently
 * missed by screen readers, because there was nothing to observe beforehand.
 * Cart mutations write into it through the provider rather than each component
 * sprouting its own region, which would produce overlapping announcements.
 */
export function LiveAnnouncer() {
  const { announcement } = useCart();

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}
