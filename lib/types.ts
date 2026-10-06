/**
 * Domain types for the storefront.
 *
 * These are OUR shapes, not Square's. Everything coming out of the Square API
 * gets normalised into these in `lib/square/catalog.ts`, so the rest of the app
 * never touches a raw Square payload. That boundary is what lets the seed
 * catalogue stand in for the live one without a single component knowing.
 */

/** Money is always minor units (cents). Never a float. */
export interface Money {
  /** e.g. 18500 === $185.00 */
  amount: number;
  /** ISO 4217, e.g. "USD" */
  currency: string;
}

export interface ProductImage {
  id: string;
  url: string;
  /**
   * Alt text. Required, never optional, never auto-generated from the product
   * name — a decorative-sounding filename is a WCAG 1.1.1 failure waiting to
   * happen. `lib/square/catalog.ts` falls back to Square's image caption and
   * flags anything still missing in development.
   */
  alt: string;
  width?: number;
  height?: number;
  /**
   * True for the generated stand-in tiles used until Sydney's photography
   * lands. `ProductMedia` renders these as woven SVG texture rather than
   * pushing them through next/image, and they are never given alt text that
   * pretends to describe a real piece.
   */
  placeholder?: boolean;
}

export interface ProductVariation {
  id: string;
  name: string;
  sku?: string;
  price: Money;
  /** Square's "track inventory" flag for this variation. */
  tracksInventory: boolean;
  /**
   * On-hand count at the configured location. `null` means Square is not
   * tracking this variation, which we treat as "always available".
   */
  quantity: number | null;
}

/** How a piece is fulfilled. Drives the PDP template and the lead-time copy. */
export type Availability = "ready-to-ship" | "made-to-order" | "sold-out";

export interface LeadTime {
  minDays: number;
  maxDays: number;
}

export interface Dimensions {
  /** Human label, e.g. "Throw" */
  label: string;
  widthIn: number;
  lengthIn: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Plain-text description. Square stores both; we prefer the plain one. */
  description: string;
  categoryIds: string[];
  images: ProductImage[];
  variations: ProductVariation[];

  // --- craft metadata, authored in Square as custom attributes -------------
  /** True when nothing is on the shelf and each order starts production. */
  madeToOrder: boolean;
  leadTime?: LeadTime;
  /** e.g. "100% Peruvian pima cotton" */
  fiber?: string;
  /** e.g. "Hand wash cold, lay flat to dry. Do not wring." */
  care?: string;
  dimensions?: Dimensions;
  /** True when only one will ever exist. The strongest line on the page. */
  oneOfAKind: boolean;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  /** Short editorial line shown under the category heading. */
  blurb?: string;
}

/* -------------------------------------------------------------------------
   Cart
   ------------------------------------------------------------------------- */

export interface CartLine {
  /** Square catalog *variation* id — the thing an order line item points at. */
  variationId: string;
  productId: string;
  slug: string;
  name: string;
  variationName: string;
  quantity: number;
  /**
   * Price captured when the line was added, used for optimistic display only.
   * The server re-reads every price from Square before charging anything.
   */
  unitPrice: Money;
  image?: ProductImage;
  availability: Availability;
  leadTime?: LeadTime;
}

export interface GiftOptions {
  isGift: boolean;
  /** Free-text, limited to 200 chars and written on a card by hand. */
  message?: string;
  recipientName?: string;
}

/* -------------------------------------------------------------------------
   Checkout
   ------------------------------------------------------------------------- */

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutRequest {
  lines: Array<{ variationId: string; quantity: number }>;
  email: string;
  phone?: string;
  shipping: Address;
  gift?: GiftOptions;
  /** Tokenised payment source from the Web Payments SDK. */
  sourceId: string;
  /** Verification token from Strong Customer Authentication, when present. */
  verificationToken?: string;
  /** Client-generated UUID so a retried request never double-charges. */
  idempotencyKey: string;
}

export interface OrderSummary {
  orderId: string;
  receiptNumber?: string;
  receiptUrl?: string;
  total: Money;
  subtotal: Money;
  shipping: Money;
  tax: Money;
  email: string;
  /** Longest lead time across the lines — what the confirmation page promises. */
  estimatedShipBy?: string;
}

/* -------------------------------------------------------------------------
   Commission & waitlist
   ------------------------------------------------------------------------- */

export interface CommissionRequest {
  name: string;
  email: string;
  phone?: string;
  /** Which kind of piece, from a fixed list so Sydney can quote quickly. */
  pieceType: string;
  size?: string;
  colourway: string[];
  occasion?: string;
  /** ISO date. Drives whether Sydney can say yes at all. */
  neededBy?: string;
  budget?: string;
  notes?: string;
}

export interface WaitlistRequest {
  email: string;
  productId: string;
  productName: string;
}
