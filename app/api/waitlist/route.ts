import { NextResponse } from "next/server";
import { upsertCustomer } from "@/lib/square/customers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Waitlist and newsletter signups.
 *
 * A request with a `productId` is a back-in-stock request for that piece; one
 * without is a general list signup. Both land as a note on a Square customer.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; productId?: unknown; productName?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "That request wasn't readable." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like a complete email address." },
      { status: 400 },
    );
  }

  const productName =
    typeof body.productName === "string" ? body.productName.trim().slice(0, 140) : "";

  const note = productName
    ? `Waitlist — wants to know when "${productName}" is available again.`
    : "Joined the mailing list from the site.";

  await upsertCustomer({
    email,
    note,
    referenceId: productName ? "waitlist" : "newsletter",
  });

  // Always 200 for a well-formed address. Whether the address is already on
  // the list is not something an unauthenticated endpoint should disclose.
  return NextResponse.json({ ok: true });
}
