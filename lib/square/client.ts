import "server-only";

/**
 * A thin, typed wrapper over the Square Connect v2 REST API.
 *
 * Deliberately not the `square` npm SDK: this surface is small (catalog,
 * inventory, orders, payments), the REST shapes are stable and versioned by
 * the `Square-Version` header, and owning the fetch means we control retries,
 * idempotency and error shaping instead of inheriting an SDK's opinions.
 *
 * Nothing in here is importable from a client component — `server-only` makes
 * that a build error rather than a leaked access token.
 */

export type SquareEnvironment = "sandbox" | "production";

const BASE_URLS: Record<SquareEnvironment, string> = {
  sandbox: "https://connect.squareupsandbox.com",
  production: "https://connect.squareup.com",
};

export interface SquareConfig {
  environment: SquareEnvironment;
  accessToken: string;
  locationId: string;
  apiVersion: string;
}

/**
 * Reads config from the environment. Returns `null` — rather than throwing —
 * when credentials are absent, which is what lets the storefront fall back to
 * the seed catalogue and still render. Call sites must handle null.
 */
export function getSquareConfig(): SquareConfig | null {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID ?? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

  if (!accessToken || !locationId) return null;

  const environment: SquareEnvironment =
    process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";

  return {
    environment,
    accessToken,
    locationId,
    apiVersion: process.env.SQUARE_API_VERSION ?? "2025-01-23",
  };
}

export function isSquareConfigured(): boolean {
  return getSquareConfig() !== null;
}

/** An error Square returned, carrying enough detail to act on. */
export class SquareError extends Error {
  readonly status: number;
  readonly errors: SquareApiError[];

  constructor(status: number, errors: SquareApiError[], message?: string) {
    super(message ?? errors[0]?.detail ?? `Square request failed (${status})`);
    this.name = "SquareError";
    this.status = status;
    this.errors = errors;
  }

  /**
   * True when retrying the exact same request might succeed. Used to decide
   * whether to surface "try again" or "something is wrong" to the buyer.
   */
  get isRetryable(): boolean {
    return this.status >= 500 || this.status === 429;
  }

  /**
   * A message safe to show a customer. Square's `detail` strings are written
   * for developers, so anything we don't explicitly recognise becomes generic
   * rather than leaking internals onto a checkout page.
   */
  get customerMessage(): string {
    const code = this.errors[0]?.code;
    switch (code) {
      case "CARD_DECLINED":
      case "GENERIC_DECLINE":
        return "That card was declined. Try another card, or contact your bank.";
      case "CVV_FAILURE":
        return "The security code didn't match. Check the three digits on the back of the card.";
      case "ADDRESS_VERIFICATION_FAILURE":
        return "The billing postcode didn't match the card. Check it and try again.";
      case "EXPIRATION_FAILURE":
      case "INVALID_EXPIRATION":
        return "That expiry date isn't valid. Check the month and year on the card.";
      case "INSUFFICIENT_FUNDS":
        return "There aren't enough funds on that card.";
      case "CARD_EXPIRED":
        return "That card has expired.";
      case "PAYMENT_LIMIT_EXCEEDED":
        return "That payment is over the card's limit.";
      case "INVALID_CARD":
      case "INVALID_CARD_DATA":
        return "Those card details don't look right. Check the number and try again.";
      default:
        return "We couldn't take that payment. No money has left your account — please try again.";
    }
  }
}

export interface SquareApiError {
  category: string;
  code: string;
  detail?: string;
  field?: string;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /**
   * Next.js fetch cache settings. Catalog reads are revalidated on a timer and
   * busted by webhook; order and payment writes are always `no-store`.
   */
  next?: { revalidate?: number | false; tags?: string[] };
  cache?: RequestCache;
  /** Number of retries for transient failures. Writes should pass 0. */
  retries?: number;
}

/**
 * Issues a request against Square and returns the parsed body.
 *
 * Square returns 200 with an `errors` array in some partial-failure cases, so
 * the error check looks at the payload as well as the status code.
 */
export async function squareFetch<T>(
  path: string,
  options: RequestOptions = {},
  config?: SquareConfig,
): Promise<T> {
  const cfg = config ?? getSquareConfig();
  if (!cfg) {
    throw new Error(
      "Square is not configured. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
    );
  }

  const { method = "GET", body, next, cache, retries = 0 } = options;
  const url = `${BASE_URLS[cfg.environment]}${path}`;

  const init: RequestInit & { next?: RequestOptions["next"] } = {
    method,
    headers: {
      "Square-Version": cfg.apiVersion,
      Authorization: `Bearer ${cfg.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  if (cache) init.cache = cache;
  else if (next) init.next = next;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, init);
      const text = await response.text();
      const payload = text ? (JSON.parse(text) as T & { errors?: SquareApiError[] }) : ({} as T);

      if (!response.ok || (payload as { errors?: SquareApiError[] }).errors?.length) {
        const error = new SquareError(
          response.status,
          (payload as { errors?: SquareApiError[] }).errors ?? [],
        );
        if (error.isRetryable && attempt < retries) {
          lastError = error;
          // Exponential backoff with a short ceiling — a storefront render
          // cannot afford to sit here.
          await sleep(2 ** attempt * 250);
          continue;
        }
        throw error;
      }

      return payload;
    } catch (error) {
      // Network-level failure, as opposed to a Square error response.
      if (!(error instanceof SquareError) && attempt < retries) {
        lastError = error;
        await sleep(2 ** attempt * 250);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Square request failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Square requires an idempotency key on every write. Generating it on the
 * client and passing it through means a double-submitted checkout — a
 * double-click, a flaky connection, a retried fetch — creates one payment,
 * not two.
 */
export function idempotencyKey(): string {
  return crypto.randomUUID();
}
