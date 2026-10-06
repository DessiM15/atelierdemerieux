/**
 * Minimal typings and a loader for Square's Web Payments SDK.
 *
 * The SDK is loaded from Square's CDN at runtime — it cannot be bundled, and
 * the card fields it renders are cross-origin iframes. That is the point: the
 * card number never touches our DOM, our JavaScript or our server, which is
 * what keeps the site in PCI SAQ-A scope rather than SAQ-A-EP.
 */

export interface TokenResult {
  status: "OK" | "ERROR" | "ABORT" | string;
  token?: string;
  errors?: Array<{ message?: string; field?: string; type?: string }>;
  details?: { billing?: { postalCode?: string } };
}

export interface SquarePaymentMethod {
  attach: (selector: string | HTMLElement) => Promise<void>;
  tokenize: () => Promise<TokenResult>;
  destroy?: () => Promise<void>;
}

export interface PaymentRequestOptions {
  countryCode: string;
  currencyCode: string;
  total: { amount: string; label: string };
  requestShippingContact?: boolean;
  lineItems?: Array<{ amount: string; label: string }>;
}

export interface SquarePayments {
  card: (options?: Record<string, unknown>) => Promise<SquarePaymentMethod>;
  paymentRequest: (options: PaymentRequestOptions) => unknown;
  applePay: (paymentRequest: unknown) => Promise<SquarePaymentMethod>;
  googlePay: (paymentRequest: unknown) => Promise<SquarePaymentMethod>;
  cashAppPay: (
    paymentRequest: unknown,
    options: { redirectURL: string; referenceId: string },
  ) => Promise<SquarePaymentMethod & { addEventListener?: (type: string, fn: (e: unknown) => void) => void }>;
  afterpayClearpay: (paymentRequest: unknown) => Promise<SquarePaymentMethod>;
  verifyBuyer: (
    token: string,
    details: Record<string, unknown>,
  ) => Promise<{ token?: string } | null>;
}

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => SquarePayments;
    };
  }
}

const SDK_URLS = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
} as const;

let loader: Promise<void> | null = null;

/** Loads the SDK once per page, no matter how many components ask for it. */
export function loadSquareSdk(environment: "sandbox" | "production"): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Square) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-square-sdk]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Square SDK failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_URLS[environment];
    script.async = true;
    script.dataset.squareSdk = "true";
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      loader = null;
      reject(new Error("Square SDK failed to load"));
    });
    document.head.appendChild(script);
  });

  return loader;
}

/** Square wants the amount as a decimal string, not minor units. */
export function toSquareAmountString(minorUnits: number): string {
  return (minorUnits / 100).toFixed(2);
}
