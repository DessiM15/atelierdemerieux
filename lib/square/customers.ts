import "server-only";

import { type SquareConfig, getSquareConfig, idempotencyKey, squareFetch } from "./client";

/**
 * Custom order requests and waitlist signups land in Square's customer
 * directory.
 *
 * Deliberately not a third-party CRM or ESP. Sydney already lives in the
 * Square dashboard — putting leads anywhere else means a second login she will
 * not check. It also means no extra vendor, no extra API key, and no personal
 * data leaving the processor she has already agreed terms with.
 *
 * When Sydney picks an email platform later, this is the one function to
 * extend; nothing calling it needs to change.
 */

interface SquareCustomer {
  id?: string;
  email_address?: string;
  note?: string;
}

interface SearchCustomersResponse {
  customers?: SquareCustomer[];
}

interface CreateCustomerResponse {
  customer?: SquareCustomer;
}

export interface UpsertCustomerInput {
  email: string;
  givenName?: string;
  familyName?: string;
  phone?: string;
  /** Appended to any existing note, newest first, so history is not lost. */
  note: string;
  /** Groups leads in the dashboard, e.g. "custom-order" or "waitlist". */
  referenceId?: string;
}

export async function upsertCustomer(
  input: UpsertCustomerInput,
  config?: SquareConfig,
): Promise<{ ok: boolean; customerId?: string }> {
  const cfg = config ?? getSquareConfig();

  if (!cfg) {
    // Pre-connection: record it where it can be recovered from the logs rather
    // than dropping a real lead on the floor.
    console.info("[lead] (square not configured)", JSON.stringify(input));
    return { ok: true };
  }

  try {
    const existing = await squareFetch<SearchCustomersResponse>(
      "/v2/customers/search",
      {
        method: "POST",
        body: {
          limit: 1,
          query: { filter: { email_address: { exact: input.email } } },
        },
        cache: "no-store",
        retries: 1,
      },
      cfg,
    );

    const found = existing.customers?.[0];
    const stamp = new Date().toISOString().slice(0, 10);
    const entry = `[${stamp}] ${input.note}`;

    if (found?.id) {
      // Square caps notes at 4096 characters; keep the newest and trim the tail.
      const merged = `${entry}\n\n${found.note ?? ""}`.slice(0, 4096);
      await squareFetch(
        `/v2/customers/${found.id}`,
        {
          method: "PUT",
          body: {
            note: merged,
            ...(input.phone ? { phone_number: input.phone } : {}),
          },
          cache: "no-store",
          retries: 1,
        },
        cfg,
      );
      return { ok: true, customerId: found.id };
    }

    const created = await squareFetch<CreateCustomerResponse>(
      "/v2/customers",
      {
        method: "POST",
        body: {
          idempotency_key: idempotencyKey(),
          email_address: input.email,
          ...(input.givenName ? { given_name: input.givenName } : {}),
          ...(input.familyName ? { family_name: input.familyName } : {}),
          ...(input.phone ? { phone_number: input.phone } : {}),
          ...(input.referenceId ? { reference_id: input.referenceId } : {}),
          note: entry.slice(0, 4096),
        },
        cache: "no-store",
        retries: 1,
      },
      cfg,
    );

    return { ok: true, ...(created.customer?.id ? { customerId: created.customer.id } : {}) };
  } catch (error) {
    console.error("[lead] failed to record in Square:", error);
    // Never surface this to the person filling in the form — from their side
    // the request was received, and it is in the logs either way.
    console.info("[lead] (fallback)", JSON.stringify(input));
    return { ok: false };
  }
}
