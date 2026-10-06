"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "../cart-provider";
import {
  type SquarePaymentMethod,
  type SquarePayments,
  loadSquareSdk,
  toSquareAmountString,
} from "./square-payments";
import { formatMoney, add as addMoney } from "@/lib/money";
import { shippingCostFor } from "@/lib/shipping";
import type { Address } from "@/lib/types";

/* ===========================================================================
   Form shape
   =========================================================================== */

interface FormValues {
  email: string;
  phone: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isGift: boolean;
  giftRecipient: string;
  giftMessage: string;
}

const EMPTY_VALUES: FormValues = {
  email: "",
  phone: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  isGift: false,
  giftRecipient: "",
  giftMessage: "",
};

type Errors = Partial<Record<keyof FormValues | "payment", string>>;

/** Order matters: the error summary lists fields in the order they appear. */
const REQUIRED_FIELDS: Array<{ key: keyof FormValues; label: string }> = [
  { key: "email", label: "Email address" },
  { key: "name", label: "Full name" },
  { key: "line1", label: "Street address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postalCode", label: "ZIP code" },
];

function validate(values: FormValues): Errors {
  const errors: Errors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!values[field.key].toString().trim()) {
      errors[field.key] = `${field.label} is required.`;
    }
  }

  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "That doesn't look like a complete email address.";
  }

  if (values.postalCode.trim() && values.country === "US" && !/^\d{5}(-\d{4})?$/.test(values.postalCode.trim())) {
    errors.postalCode = "A US ZIP code is 5 digits, like 90210.";
  }

  if (values.isGift && values.giftMessage.length > 200) {
    errors.giftMessage = "Gift messages are limited to 200 characters.";
  }

  return errors;
}

/* ===========================================================================
   Component
   =========================================================================== */

export function CheckoutForm({
  applicationId,
  locationId,
  environment,
}: {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
}) {
  const router = useRouter();
  const { lines, subtotal, gift, setGift, clear, ready } = useCart();

  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sdkState, setSdkState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [wallets, setWallets] = useState<string[]>([]);

  const paymentsRef = useRef<SquarePayments | null>(null);
  const cardRef = useRef<SquarePaymentMethod | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const shippingCost = shippingCostFor(subtotal);
  const estimatedTotal = addMoney(subtotal, shippingCost);
  const isConfigured = Boolean(applicationId && locationId);

  /* --- empty bag -------------------------------------------------------- */
  useEffect(() => {
    if (ready && lines.length === 0 && !submitting) {
      router.replace("/shop");
    }
  }, [ready, lines.length, submitting, router]);

  /* --- keep gift options in the cart so they survive a refresh ---------- */
  useEffect(() => {
    setValues((current) => ({
      ...current,
      isGift: gift.isGift,
      giftRecipient: gift.recipientName ?? "",
      giftMessage: gift.message ?? "",
    }));
    // Only on mount — afterwards the form is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --- Square SDK ------------------------------------------------------- */
  useEffect(() => {
    if (!isConfigured) {
      setSdkState("unavailable");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadSquareSdk(environment);
        if (cancelled || !window.Square) {
          setSdkState("unavailable");
          return;
        }

        const payments = window.Square.payments(applicationId, locationId);
        paymentsRef.current = payments;

        const card = await payments.card({
          style: {
            input: { fontSize: "15px", color: "#280b0f" },
            ".input-container": { borderColor: "#bcb09a", borderRadius: "1px" },
            ".input-container.is-focus": { borderColor: "#813a3e" },
            ".input-container.is-error": { borderColor: "#813a3e" },
            ".message-text.is-error": { color: "#813a3e" },
          },
        });
        await card.attach("#square-card");
        if (cancelled) {
          await card.destroy?.();
          return;
        }
        cardRef.current = card;
        setSdkState("ready");

        // Express wallets are best-effort: Apple Pay throws on a device that
        // cannot offer it, Afterpay throws outside its supported regions and
        // amounts. Each is attempted independently so one failure never takes
        // the others — or the card form — down with it.
        void attachWallets(payments, estimatedTotal.amount, setWallets);
      } catch (error) {
        console.error("[checkout] Square SDK init failed:", error);
        if (!cancelled) setSdkState("unavailable");
      }
    })();

    return () => {
      cancelled = true;
      void cardRef.current?.destroy?.();
      cardRef.current = null;
    };
    // The card form is attached once; the amount only affects wallet buttons,
    // which re-attach on their own when the bag changes meaningfully.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, locationId, environment, isConfigured]);

  /* --- field helpers ---------------------------------------------------- */
  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((current) => ({ ...current, [key]: value }));
      // Clear an error as soon as the field is touched — leaving stale errors
      // on screen while someone is actively fixing them is hostile.
      setErrors((current) => {
        if (!current[key]) return current;
        const next = { ...current };
        delete next[key];
        return next;
      });
    },
    [],
  );

  /* --- submit ----------------------------------------------------------- */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      // Move focus to the summary so the problem is announced and reachable,
      // rather than silently appearing above the fold (WCAG 3.3.1).
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    if (!cardRef.current) {
      setErrors({ payment: "The payment form hasn't finished loading. Give it a moment." });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const tokenResult = await cardRef.current.tokenize();

      if (tokenResult.status !== "OK" || !tokenResult.token) {
        const message =
          tokenResult.errors?.[0]?.message ??
          "Those card details couldn't be verified. Check them and try again.";
        setErrors({ payment: message });
        requestAnimationFrame(() => summaryRef.current?.focus());
        setSubmitting(false);
        return;
      }

      // Strong Customer Authentication. Square runs 3-D Secure where the
      // issuer requires it; without this a European card is declined.
      let verificationToken: string | undefined;
      try {
        const verification = await paymentsRef.current?.verifyBuyer(tokenResult.token, {
          amount: toSquareAmountString(estimatedTotal.amount),
          currencyCode: estimatedTotal.currency,
          intent: "CHARGE",
          billingContact: {
            givenName: values.name.split(" ")[0] ?? values.name,
            familyName: values.name.split(" ").slice(1).join(" "),
            email: values.email.trim(),
            addressLines: [values.line1, values.line2].filter(Boolean),
            city: values.city,
            state: values.state,
            postalCode: values.postalCode,
            countryCode: values.country,
          },
        });
        verificationToken = verification?.token;
      } catch (error) {
        // Verification is not supported for every method; proceed without it
        // rather than blocking an otherwise valid payment.
        console.warn("[checkout] buyer verification skipped:", error);
      }

      const shipping: Address = {
        name: values.name.trim(),
        line1: values.line1.trim(),
        ...(values.line2.trim() ? { line2: values.line2.trim() } : {}),
        city: values.city.trim(),
        state: values.state.trim(),
        postalCode: values.postalCode.trim(),
        country: values.country,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map((line) => ({
            variationId: line.variationId,
            quantity: line.quantity,
          })),
          email: values.email.trim(),
          ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
          shipping,
          ...(values.isGift
            ? {
                gift: {
                  isGift: true,
                  recipientName: values.giftRecipient.trim() || undefined,
                  message: values.giftMessage.trim() || undefined,
                },
              }
            : {}),
          sourceId: tokenResult.token,
          ...(verificationToken ? { verificationToken } : {}),
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        order?: unknown;
        error?: string;
        unavailable?: Array<{ name: string; available: number }>;
      };

      if (!response.ok || !payload.ok) {
        const detail =
          payload.unavailable && payload.unavailable.length > 0
            ? ` ${payload.unavailable
                .map((item) =>
                  item.available === 0
                    ? `${item.name} has sold out.`
                    : `Only ${item.available} of ${item.name} remain.`,
                )
                .join(" ")}`
            : "";
        setErrors({ payment: `${payload.error ?? "That payment didn't go through."}${detail}` });
        requestAnimationFrame(() => summaryRef.current?.focus());
        setSubmitting(false);
        return;
      }

      // Hand the confirmation page its data without putting order details in a
      // URL that could be shared, logged or guessed.
      try {
        sessionStorage.setItem("adm.lastOrder", JSON.stringify(payload.order));
      } catch {
        // Confirmation page has a fallback for this.
      }

      clear();
      router.push("/checkout/confirmation");
    } catch (error) {
      console.error("[checkout] submit failed:", error);
      setErrors({
        payment: "We couldn't reach the payment service. No money has left your account.",
      });
      requestAnimationFrame(() => summaryRef.current?.focus());
      setSubmitting(false);
    }
  }

  /* --- render ----------------------------------------------------------- */
  const errorEntries = Object.entries(errors) as Array<[keyof FormValues | "payment", string]>;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      {/* --- error summary --------------------------------------------- */}
      <div
        ref={summaryRef}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        className={errorEntries.length > 0 ? "border-l-2 border-rubine bg-parchment p-5" : "sr-only"}
      >
        {errorEntries.length > 0 ? (
          <>
            <h2 className="mb-2 font-display text-lg text-rubine">
              {errorEntries.length === 1
                ? "There's one thing to fix"
                : `There are ${errorEntries.length} things to fix`}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {errorEntries.map(([key, message]) => (
                <li key={key} className="text-[0.9375rem]">
                  {key === "payment" ? (
                    message
                  ) : (
                    <a href={`#field-${key}`} className="link">
                      {message}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {/* --- contact ---------------------------------------------------- */}
      <fieldset className="flex flex-col gap-5">
        <legend className="display-sm mb-2">Where the receipt goes</legend>

        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          hint="Your receipt and shipping notice are sent here."
          onChange={(value) => setField("email", value)}
        />

        <Field
          id="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          hint="Only used if there's a problem with delivery."
          onChange={(value) => setField("phone", value)}
        />
      </fieldset>

      {/* --- shipping --------------------------------------------------- */}
      <fieldset className="flex flex-col gap-5">
        <legend className="display-sm mb-2">Where it's going</legend>

        <Field
          id="name"
          label="Full name"
          autoComplete="name"
          required
          value={values.name}
          error={errors.name}
          onChange={(value) => setField("name", value)}
        />

        <Field
          id="line1"
          label="Street address"
          autoComplete="address-line1"
          required
          value={values.line1}
          error={errors.line1}
          onChange={(value) => setField("line1", value)}
        />

        <Field
          id="line2"
          label="Apartment, suite (optional)"
          autoComplete="address-line2"
          value={values.line2}
          onChange={(value) => setField("line2", value)}
        />

        <div className="grid gap-5 sm:grid-cols-[2fr_1fr_1fr]">
          <Field
            id="city"
            label="City"
            autoComplete="address-level2"
            required
            value={values.city}
            error={errors.city}
            onChange={(value) => setField("city", value)}
          />
          <Field
            id="state"
            label="State"
            autoComplete="address-level1"
            required
            value={values.state}
            error={errors.state}
            onChange={(value) => setField("state", value)}
          />
          <Field
            id="postalCode"
            label="ZIP code"
            autoComplete="postal-code"
            inputMode="numeric"
            required
            value={values.postalCode}
            error={errors.postalCode}
            onChange={(value) => setField("postalCode", value)}
          />
        </div>
      </fieldset>

      {/* --- gift -------------------------------------------------------- */}
      <fieldset className="flex flex-col gap-4">
        <legend className="display-sm mb-2">Is this a gift?</legend>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={values.isGift}
            onChange={(event) => {
              setField("isGift", event.target.checked);
              setGift({ ...gift, isGift: event.target.checked });
            }}
            className="mt-1 size-4 accent-[#813a3e]"
          />
          <span className="text-[0.9375rem]">
            Send it as a gift
            <span className="block text-[0.8125rem] text-muted">
              No prices on the packing slip, and a hand-written card in the box.
            </span>
          </span>
        </label>

        {values.isGift ? (
          <div className="flex flex-col gap-5 border-l-2 border-camel pl-5">
            <Field
              id="giftRecipient"
              label="Who it's for"
              value={values.giftRecipient}
              onChange={(value) => setField("giftRecipient", value)}
            />
            <Field
              id="giftMessage"
              label="Card message"
              multiline
              maxLength={200}
              value={values.giftMessage}
              error={errors.giftMessage}
              hint={`${values.giftMessage.length} of 200 characters. Sydney writes this by hand.`}
              onChange={(value) => setField("giftMessage", value)}
            />
          </div>
        ) : null}
      </fieldset>

      {/* --- payment ----------------------------------------------------- */}
      <fieldset className="flex flex-col gap-5">
        <legend className="display-sm mb-2">Payment</legend>

        {sdkState === "unavailable" ? (
          <div className="border-l-2 border-rubine bg-parchment p-5">
            <p className="text-[0.9375rem]">
              Card payment isn&apos;t available right now.{" "}
              {isConfigured
                ? "The payment service didn't load — refresh and try again."
                : "This site hasn't been connected to Square yet."}
            </p>
          </div>
        ) : null}

        {wallets.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="eyebrow">Express checkout</p>
            <div id="square-wallets" className="flex flex-col gap-2.5" />
            <div className="flex items-center gap-4 py-1">
              <span className="h-px flex-1 bg-rule" aria-hidden="true" />
              <span className="text-[0.75rem] uppercase tracking-[0.18em] text-muted">
                or pay by card
              </span>
              <span className="h-px flex-1 bg-rule" aria-hidden="true" />
            </div>
          </div>
        ) : null}

        <div>
          <span className="field-label" id="card-label">
            Card details
          </span>
          {/* Square renders its own labelled, keyboard-accessible inputs into
              this container as a cross-origin iframe. */}
          <div
            id="square-card"
            className="min-h-[3.25rem]"
            aria-labelledby="card-label"
            aria-busy={sdkState === "loading"}
          />
          {sdkState === "loading" ? (
            <p className="field-hint" role="status">
              Loading secure payment fields…
            </p>
          ) : null}
        </div>

        <p className="text-[0.8125rem] leading-relaxed text-muted">
          Card details go straight to Square and never touch this site&apos;s servers. Payments are
          processed by Square, Inc.
        </p>
      </fieldset>

      {/* --- totals + submit --------------------------------------------- */}
      <div className="border-t border-rule pt-6">
        <dl className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <dt className="text-[0.9375rem] text-muted">Subtotal</dt>
            <dd className="numeric text-[0.9375rem]">{formatMoney(subtotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-[0.9375rem] text-muted">Shipping</dt>
            <dd className="numeric text-[0.9375rem]">
              {shippingCost.amount === 0 ? "Free" : formatMoney(shippingCost)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-rule pt-3">
            <dt className="tracked text-[0.75rem]">Total</dt>
            <dd className="numeric font-display text-2xl">
              {formatMoney(estimatedTotal)}
              <span className="sr-only"> before tax</span>
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-[0.75rem] text-muted">
          Tax is calculated by Square at the moment of payment and added to this total.
        </p>

        <button
          type="submit"
          className="btn btn-primary mt-6 w-full"
          disabled={submitting || sdkState !== "ready"}
        >
          {submitting ? "Taking payment…" : `Pay ${formatMoney(estimatedTotal)}`}
        </button>

        <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted">
          By paying you agree that every piece is made once, by hand, and that{" "}
          <Link href="/policies/returns" className="link">
            all sales are final
          </Link>
          . If anything arrives damaged or isn&apos;t as described, Sydney will put it right.
        </p>
      </div>
    </form>
  );
}

/* ===========================================================================
   Express wallets
   =========================================================================== */

async function attachWallets(
  payments: SquarePayments,
  amountMinor: number,
  setWallets: (names: string[]) => void,
) {
  const container = document.getElementById("square-wallets");
  if (!container) return;

  const attached: string[] = [];

  const request = payments.paymentRequest({
    countryCode: "US",
    currencyCode: "USD",
    total: { amount: toSquareAmountString(amountMinor), label: "Atelier de Merieux" },
  });

  const candidates: Array<{ name: string; init: () => Promise<SquarePaymentMethod> }> = [
    { name: "Apple Pay", init: () => payments.applePay(request) },
    { name: "Google Pay", init: () => payments.googlePay(request) },
    { name: "Afterpay", init: () => payments.afterpayClearpay(request) },
  ];

  for (const candidate of candidates) {
    try {
      const method = await candidate.init();
      const slot = document.createElement("div");
      slot.id = `wallet-${candidate.name.replace(/\s+/g, "-").toLowerCase()}`;
      slot.setAttribute("aria-label", `Pay with ${candidate.name}`);
      container.appendChild(slot);
      await method.attach(slot);
      attached.push(candidate.name);
    } catch {
      // Unsupported on this device, browser, region or amount. Expected, and
      // not an error worth surfacing — the card form is always there.
    }
  }

  setWallets(attached);
}

/* ===========================================================================
   Field
   =========================================================================== */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  required?: boolean;
  error?: string;
  hint?: string;
  multiline?: boolean;
  maxLength?: number;
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  required = false,
  error,
  hint,
  multiline = false,
  maxLength,
}: FieldProps) {
  const fieldId = `field-${id}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  const shared = {
    id: fieldId,
    name: id,
    value,
    required,
    className: "field",
    ...(autoComplete ? { autoComplete } : {}),
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(error ? { "aria-invalid": true as const } : {}),
    ...(maxLength ? { maxLength } : {}),
  };

  return (
    <div>
      <label htmlFor={fieldId} className="field-label">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>

      {multiline ? (
        <textarea
          {...shared}
          rows={3}
          className="field resize-y"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...shared}
          type={type}
          {...(inputMode ? { inputMode } : {})}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error ? (
        <p id={errorId} className="field-error">
          <span aria-hidden="true">↳</span>
          <span>{error}</span>
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
