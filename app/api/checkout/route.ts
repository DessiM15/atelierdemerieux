import { NextResponse } from "next/server";
import { SquareError, getSquareConfig } from "@/lib/square/client";
import { assertStockAvailable } from "@/lib/square/inventory";
import { createOrder, summarise, takePayment } from "@/lib/square/orders";
import { getProducts } from "@/lib/square/catalog";
import type { Address } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================================================================
   Validation
   ---------------------------------------------------------------------------
   Everything that reaches Square is validated here first. Note what is NOT
   accepted from the request: prices, totals, product names, shipping cost.
   The body carries variation ids and quantities only — Square prices the order
   from its own catalogue, so a tampered request cannot change what is charged.
   =========================================================================== */

interface CheckoutBody {
  lines?: unknown;
  email?: unknown;
  phone?: unknown;
  shipping?: unknown;
  gift?: unknown;
  sourceId?: unknown;
  verificationToken?: unknown;
  idempotencyKey?: unknown;
}

const MAX_LINES = 40;
const MAX_QUANTITY_PER_LINE = 20;

function badRequest(message: string, field?: string) {
  return NextResponse.json({ error: message, ...(field ? { field } : {}) }, { status: 400 });
}

function isNonEmptyString(value: unknown, max = 255): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function parseAddress(value: unknown): Address | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;

  if (
    !isNonEmptyString(raw.name, 120) ||
    !isNonEmptyString(raw.line1, 200) ||
    !isNonEmptyString(raw.city, 100) ||
    !isNonEmptyString(raw.state, 60) ||
    !isNonEmptyString(raw.postalCode, 20) ||
    !isNonEmptyString(raw.country, 2)
  ) {
    return null;
  }

  return {
    name: raw.name.trim(),
    line1: raw.line1.trim(),
    ...(isNonEmptyString(raw.line2, 200) ? { line2: raw.line2.trim() } : {}),
    city: raw.city.trim(),
    state: raw.state.trim(),
    postalCode: raw.postalCode.trim(),
    country: raw.country.trim().toUpperCase(),
  };
}

/* ========================================================================= */

export async function POST(request: Request) {
  const config = getSquareConfig();
  if (!config) {
    // The storefront is browsable before Square is connected; checkout is not.
    // Say so plainly rather than failing somewhere deeper with a 500.
    return NextResponse.json(
      {
        error:
          "Checkout isn't connected yet. Square credentials haven't been added to this environment.",
        code: "SQUARE_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return badRequest("That request wasn't readable.");
  }

  // --- lines --------------------------------------------------------------
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return badRequest("Your bag is empty.");
  }
  if (body.lines.length > MAX_LINES) {
    return badRequest("That's more items than we can process in one order.");
  }

  const lines: Array<{ variationId: string; quantity: number }> = [];
  for (const entry of body.lines) {
    if (typeof entry !== "object" || entry === null) return badRequest("Invalid item in bag.");
    const raw = entry as Record<string, unknown>;
    const variationId = raw.variationId;
    const quantity = raw.quantity;

    if (!isNonEmptyString(variationId, 192)) return badRequest("Invalid item in bag.");
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY_PER_LINE
    ) {
      return badRequest("Invalid quantity.");
    }

    lines.push({ variationId, quantity });
  }

  // --- buyer --------------------------------------------------------------
  if (!isNonEmptyString(body.email, 254) || !body.email.includes("@")) {
    return badRequest("We need a valid email address to send your receipt.", "email");
  }
  const email = body.email.trim();

  const shipping = parseAddress(body.shipping);
  if (!shipping) {
    return badRequest("That shipping address is incomplete.", "shipping");
  }

  if (!isNonEmptyString(body.sourceId, 1024)) {
    return badRequest("That payment couldn't be read. Try again.");
  }
  if (!isNonEmptyString(body.idempotencyKey, 128)) {
    return badRequest("Missing request key.");
  }

  const phone = isNonEmptyString(body.phone, 40) ? body.phone.trim() : undefined;
  const verificationToken = isNonEmptyString(body.verificationToken, 2048)
    ? body.verificationToken
    : undefined;

  // --- gift ---------------------------------------------------------------
  let gift: { isGift: boolean; message?: string; recipientName?: string } | undefined;
  if (typeof body.gift === "object" && body.gift !== null) {
    const raw = body.gift as Record<string, unknown>;
    if (raw.isGift === true) {
      gift = {
        isGift: true,
        ...(isNonEmptyString(raw.message, 200) ? { message: raw.message.trim() } : {}),
        ...(isNonEmptyString(raw.recipientName, 120)
          ? { recipientName: raw.recipientName.trim() }
          : {}),
      };
    }
  }

  /* ----------------------------------------------------------------------
     Stock re-check.
     A bag can sit open for hours. For a maker whose pieces are frequently
     one of one, taking money for something that sold ten minutes ago is the
     worst outcome the site can produce — worse than losing the sale.
     ---------------------------------------------------------------------- */
  try {
    const products = await getProducts();
    const nameFor = (variationId: string) => {
      for (const product of products) {
        const variation = product.variations.find((entry) => entry.id === variationId);
        if (variation) {
          return variation.name === "Standard" ? product.name : `${product.name} (${variation.name})`;
        }
      }
      return "An item in your bag";
    };

    const stock = await assertStockAvailable(
      lines.map((line) => ({ ...line, name: nameFor(line.variationId) })),
      config,
    );

    if (!stock.ok) {
      return NextResponse.json(
        {
          error: "Something in your bag sold while you were checking out.",
          code: "OUT_OF_STOCK",
          unavailable: stock.unavailable,
        },
        { status: 409 },
      );
    }
  } catch (error) {
    console.error("[checkout] stock check failed:", error);
    // A failed stock read should not block a sale outright; Square will still
    // reject an order for an item it cannot fulfil.
  }

  /* ----------------------------------------------------------------------
     Order, then payment.
     ---------------------------------------------------------------------- */
  try {
    const { order, subtotal, shipping: shippingCost } = await createOrder(
      {
        lines,
        email,
        ...(phone ? { phone } : {}),
        shipping,
        ...(gift ? { gift } : {}),
        idempotencyKey: `${body.idempotencyKey}-order`,
      },
      config,
    );

    const total = {
      amount: order.total_money?.amount ?? 0,
      currency: order.total_money?.currency ?? "USD",
    };

    if (total.amount <= 0) {
      return NextResponse.json(
        { error: "That order totalled nothing. Nothing has been charged." },
        { status: 400 },
      );
    }

    const payment = await takePayment(
      {
        orderId: order.id!,
        amount: total,
        sourceId: body.sourceId,
        idempotencyKey: `${body.idempotencyKey}-payment`,
        email,
        billing: shipping,
        ...(verificationToken ? { verificationToken } : {}),
      },
      config,
    );

    const summary = summarise(order, payment, {
      subtotal,
      shipping: shippingCost,
      email,
    });

    return NextResponse.json({ ok: true, order: summary });
  } catch (error) {
    if (error instanceof SquareError) {
      console.error("[checkout] square error:", error.status, error.errors);
      return NextResponse.json(
        { error: error.customerMessage, code: error.errors[0]?.code },
        { status: error.status >= 500 ? 502 : 402 },
      );
    }

    console.error("[checkout] unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong on our side. No payment was taken." },
      { status: 500 },
    );
  }
}
