import "server-only";

import type { Address, GiftOptions, Money, OrderSummary } from "../types";
import { money } from "../money";
import { shippingCostFor } from "../shipping";
import { type SquareConfig, SquareError, getSquareConfig, squareFetch } from "./client";

/* ===========================================================================
   Raw Square shapes
   =========================================================================== */

interface SquareMoney {
  amount?: number;
  currency?: string;
}

interface SquareOrder {
  id?: string;
  total_money?: SquareMoney;
  total_tax_money?: SquareMoney;
  total_service_charge_money?: SquareMoney;
  total_discount_money?: SquareMoney;
  net_amounts?: {
    total_money?: SquareMoney;
    tax_money?: SquareMoney;
    service_charge_money?: SquareMoney;
  };
  line_items?: Array<{
    uid?: string;
    name?: string;
    quantity?: string;
    base_price_money?: SquareMoney;
    total_money?: SquareMoney;
  }>;
}

interface CreateOrderResponse {
  order?: SquareOrder;
}

interface SquarePayment {
  id?: string;
  status?: string;
  order_id?: string;
  receipt_number?: string;
  receipt_url?: string;
  amount_money?: SquareMoney;
}

interface CreatePaymentResponse {
  payment?: SquarePayment;
}

function toMoney(value: SquareMoney | undefined, fallbackCurrency = "USD"): Money {
  return {
    amount: value?.amount ?? 0,
    currency: value?.currency ?? fallbackCurrency,
  };
}

function toSquareAddress(address: Address) {
  return {
    address_line_1: address.line1,
    ...(address.line2 ? { address_line_2: address.line2 } : {}),
    locality: address.city,
    administrative_district_level_1: address.state,
    postal_code: address.postalCode,
    country: address.country,
  };
}

/* ===========================================================================
   Order creation
   =========================================================================== */

export interface CreateOrderInput {
  lines: Array<{ variationId: string; quantity: number }>;
  email: string;
  phone?: string;
  shipping: Address;
  gift?: GiftOptions;
  idempotencyKey: string;
}

/**
 * Creates a draft order in Square.
 *
 * Line items reference `catalog_object_id`, which means **Square prices the
 * order from its own catalogue**. Nothing the browser sends can influence what
 * a buyer is charged — a client that posts a $1 blanket still gets billed the
 * catalogue price. This is the single most important property of the checkout
 * and the reason prices are never accepted from the request body.
 */
export async function createOrder(
  input: CreateOrderInput,
  config?: SquareConfig,
): Promise<{ order: SquareOrder; subtotal: Money; shipping: Money }> {
  const cfg = config ?? getSquareConfig();
  if (!cfg) throw new Error("Square is not configured.");

  // Price the order once with no shipping so the subtotal is known, then
  // apply the threshold rule. Square's Calculate endpoint does this without
  // persisting anything.
  const draft = {
    location_id: cfg.locationId,
    line_items: input.lines.map((line) => ({
      catalog_object_id: line.variationId,
      quantity: String(line.quantity),
    })),
  };

  const calculated = await squareFetch<{ order?: SquareOrder }>(
    "/v2/orders/calculate",
    {
      method: "POST",
      body: { order: draft },
      cache: "no-store",
      retries: 1,
    },
    cfg,
  );

  const subtotalSource =
    calculated.order?.net_amounts?.total_money ?? calculated.order?.total_money;
  const subtotal = toMoney(subtotalSource);
  const shipping = shippingCostFor(subtotal);

  const giftNote = buildGiftNote(input.gift);

  const response = await squareFetch<CreateOrderResponse>(
    "/v2/orders",
    {
      method: "POST",
      body: {
        idempotency_key: input.idempotencyKey,
        order: {
          ...draft,
          ...(shipping.amount > 0
            ? {
                service_charges: [
                  {
                    name: "Shipping",
                    amount_money: { amount: shipping.amount, currency: shipping.currency },
                    // TOTAL_PHASE applies after tax. Shipping taxability varies
                    // by state; leaving it untaxed is the conservative default
                    // for a single-location seller. Revisit with her accountant.
                    calculation_phase: "TOTAL_PHASE",
                  },
                ],
              }
            : {}),
          fulfillments: [
            {
              type: "SHIPMENT",
              state: "PROPOSED",
              shipment_details: {
                recipient: {
                  display_name: input.shipping.name,
                  email_address: input.email,
                  ...(input.phone ? { phone_number: input.phone } : {}),
                  address: toSquareAddress(input.shipping),
                },
                ...(giftNote ? { shipping_note: giftNote } : {}),
              },
            },
          ],
          ...(giftNote ? { note: giftNote.slice(0, 500) } : {}),
          metadata: {
            source: "atelier_web",
            is_gift: String(Boolean(input.gift?.isGift)),
          },
        },
      },
      cache: "no-store",
      // Order creation is idempotent via the key, so a retry is safe.
      retries: 1,
    },
    cfg,
  );

  const order = response.order;
  if (!order?.id) {
    throw new SquareError(502, [], "Square accepted the order but returned no id.");
  }

  return { order, subtotal, shipping };
}

/** Square caps notes at 500 characters; the form caps the message at 200. */
function buildGiftNote(gift: GiftOptions | undefined): string | undefined {
  if (!gift?.isGift) return undefined;
  const parts = ["GIFT ORDER — no prices on the packing slip."];
  if (gift.recipientName) parts.push(`For: ${gift.recipientName}`);
  if (gift.message) parts.push(`Card: "${gift.message}"`);
  return parts.join(" ").slice(0, 500);
}

/* ===========================================================================
   Payment
   =========================================================================== */

export interface TakePaymentInput {
  orderId: string;
  amount: Money;
  sourceId: string;
  idempotencyKey: string;
  email: string;
  billing?: Address;
  verificationToken?: string;
}

/**
 * Charges a tokenised payment source against an existing order.
 *
 * `autocomplete: true` captures immediately. For made-to-order work there is a
 * reasonable argument for authorising now and capturing when the piece ships —
 * but Square authorisations expire after six days, and Sydney's lead times run
 * to three weeks, so capture-on-order is the only workable option. This is why
 * the lead time has to be disclosed before the buyer reaches this point.
 */
export async function takePayment(
  input: TakePaymentInput,
  config?: SquareConfig,
): Promise<SquarePayment> {
  const cfg = config ?? getSquareConfig();
  if (!cfg) throw new Error("Square is not configured.");

  const response = await squareFetch<CreatePaymentResponse>(
    "/v2/payments",
    {
      method: "POST",
      body: {
        idempotency_key: input.idempotencyKey,
        source_id: input.sourceId,
        order_id: input.orderId,
        location_id: cfg.locationId,
        amount_money: { amount: input.amount.amount, currency: input.amount.currency },
        autocomplete: true,
        buyer_email_address: input.email,
        ...(input.billing ? { billing_address: toSquareAddress(input.billing) } : {}),
        ...(input.verificationToken ? { verification_token: input.verificationToken } : {}),
      },
      cache: "no-store",
      // Never retry a charge automatically. The idempotency key makes a retry
      // safe in principle, but a transient network error here is better
      // surfaced to the buyer than silently re-attempted.
      retries: 0,
    },
    cfg,
  );

  const payment = response.payment;
  if (!payment?.id) {
    throw new SquareError(502, [], "Square accepted the payment but returned no id.");
  }

  return payment;
}

/* ===========================================================================
   Summary
   =========================================================================== */

export function summarise(
  order: SquareOrder,
  payment: SquarePayment,
  parts: { subtotal: Money; shipping: Money; email: string; estimatedShipBy?: string },
): OrderSummary {
  return {
    orderId: order.id ?? "",
    ...(payment.receipt_number ? { receiptNumber: payment.receipt_number } : {}),
    ...(payment.receipt_url ? { receiptUrl: payment.receipt_url } : {}),
    total: toMoney(order.total_money),
    subtotal: parts.subtotal,
    shipping: parts.shipping,
    tax: toMoney(order.total_tax_money),
    email: parts.email,
    ...(parts.estimatedShipBy ? { estimatedShipBy: parts.estimatedShipBy } : {}),
  };
}

export { money };
