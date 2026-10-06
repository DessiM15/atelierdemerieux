import { NextResponse } from "next/server";
import { upsertCustomer } from "@/lib/square/customers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PIECE_TYPES = [
  "Blanket or throw",
  "Baby or christening piece",
  "Pillow or cushion cover",
  "Table linen",
  "Bag or tote",
  "Something else",
] as const;

const COLOURS = ["Plum", "Taupe", "Cream", "Camel", "Deep wine", "Sydney's choice"] as const;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "That request wasn't readable." }, { status: 400 });
  }

  const name = str(body.name, 120);
  const email = str(body.email, 254);
  const pieceType = str(body.pieceType, 80);

  if (!name) {
    return NextResponse.json({ error: "We need a name.", field: "name" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { error: "That doesn't look like a complete email address.", field: "email" },
      { status: 400 },
    );
  }
  if (!PIECE_TYPES.includes(pieceType as (typeof PIECE_TYPES)[number])) {
    return NextResponse.json(
      { error: "Choose what kind of piece you have in mind.", field: "pieceType" },
      { status: 400 },
    );
  }

  const colourway = Array.isArray(body.colourway)
    ? body.colourway
        .filter((entry): entry is string => typeof entry === "string")
        .filter((entry) => COLOURS.includes(entry as (typeof COLOURS)[number]))
    : [];

  const size = str(body.size, 120);
  const occasion = str(body.occasion, 120);
  const neededBy = str(body.neededBy, 40);
  const budget = str(body.budget, 60);
  const notes = str(body.notes, 1500);
  const phone = str(body.phone, 40);

  // Written so Sydney can read it in the Square app on her phone and quote
  // from it without opening anything else.
  const note = [
    `CUSTOM ORDER REQUEST — ${pieceType}`,
    size ? `Size: ${size}` : null,
    colourway.length > 0 ? `Colours: ${colourway.join(", ")}` : null,
    occasion ? `Occasion: ${occasion}` : null,
    neededBy ? `Needed by: ${neededBy}` : null,
    budget ? `Budget: ${budget}` : null,
    notes ? `Notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const [givenName, ...rest] = name.split(/\s+/);

  const result = await upsertCustomer({
    email,
    ...(givenName ? { givenName } : {}),
    ...(rest.length > 0 ? { familyName: rest.join(" ") } : {}),
    ...(phone ? { phone } : {}),
    note,
    referenceId: "custom-order",
  });

  if (!result.ok) {
    // The lead is in the logs, but telling someone their request went through
    // when we are not certain would be worse than asking them to try again.
    return NextResponse.json(
      { error: "We couldn't save that just now. Try again, or email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
