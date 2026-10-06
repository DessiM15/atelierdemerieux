import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/square/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Square webhook receiver.
 *
 * Subscribe in the Square dashboard (Developer → Webhooks) to:
 *   catalog.version.updated   — an item was edited, added or removed
 *   inventory.count.updated   — stock moved, including from an in-person sale
 *
 * The second one matters more than it looks: if Sydney sells a one-of-a-kind
 * piece at a market, this is what takes it off the website before someone buys
 * it again online.
 */

const SIGNATURE_HEADER = "x-square-hmacsha256-signature";

/**
 * Square signs the concatenation of the notification URL and the raw body.
 * The URL must match the subscription exactly — including scheme and any
 * trailing path — or every signature will fail.
 */
function isValidSignature(signature: string, notificationUrl: string, rawBody: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return false;

  const expected = createHmac("sha256", key)
    .update(notificationUrl + rawBody)
    .digest("base64");

  const received = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  // Length check first: timingSafeEqual throws on a mismatch rather than
  // returning false.
  if (received.length !== computed.length) return false;
  return timingSafeEqual(received, computed);
}

export async function POST(request: Request) {
  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  const rawBody = await request.text();

  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/webhooks/square`;

  if (!isValidSignature(signature, notificationUrl, rawBody)) {
    // Do not say which part failed — an unauthenticated caller learns nothing.
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string };
  try {
    event = JSON.parse(rawBody) as { type?: string };
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  switch (event.type) {
    case "catalog.version.updated":
    case "inventory.count.updated":
      // `{ expire: 0 }` purges immediately rather than waiting out a profile.
      // Stock changing is exactly the case where a stale read sells a piece
      // that no longer exists.
      revalidateTag(CATALOG_TAG, { expire: 0 });
      break;
    default:
      // Unsubscribed event types are acknowledged and ignored. Returning a
      // non-2xx here would make Square retry something we do not want.
      break;
  }

  return NextResponse.json({ ok: true });
}
