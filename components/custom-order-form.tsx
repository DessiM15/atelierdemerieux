"use client";

import { useRef, useState } from "react";

/* ===========================================================================
   Options — kept in sync with the server's allowlist in /api/custom-order.
   =========================================================================== */

const PIECE_TYPES = [
  "Blanket or throw",
  "Baby or christening piece",
  "Pillow or cushion cover",
  "Table linen",
  "Bag or tote",
  "Something else",
] as const;

const COLOURS = [
  { name: "Plum", hex: "#5e2338" },
  { name: "Taupe", hex: "#6f5e45" },
  { name: "Cream", hex: "#e9dcc3" },
  { name: "Camel", hex: "#bcb09a" },
  { name: "Deep wine", hex: "#2c0c1a" },
  { name: "Sydney's choice", hex: "" },
] as const;

const BUDGETS = ["Under $150", "$150 – $300", "$300 – $500", "$500+", "Not sure yet"] as const;

interface Values {
  name: string;
  email: string;
  phone: string;
  pieceType: string;
  size: string;
  colourway: string[];
  occasion: string;
  neededBy: string;
  budget: string;
  notes: string;
}

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  pieceType: "",
  size: "",
  colourway: [],
  occasion: "",
  neededBy: "",
  budget: "",
  notes: "",
};

type Errors = Partial<Record<keyof Values | "form", string>>;

/* ========================================================================= */

export function CustomOrderForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function toggleColour(name: string) {
    setValues((current) => ({
      ...current,
      colourway: current.colourway.includes(name)
        ? current.colourway.filter((entry) => entry !== name)
        : [...current.colourway, name],
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found: Errors = {};
    if (!values.name.trim()) found.name = "We need a name to put on the quote.";
    if (!values.email.trim()) found.email = "We need an email address to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      found.email = "That doesn't look like a complete email address.";
    }
    if (!values.pieceType) found.pieceType = "Choose what kind of piece you have in mind.";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setErrors({ form: payload.error ?? "We couldn't send that. Try again in a moment." });
        requestAnimationFrame(() => summaryRef.current?.focus());
        setSubmitting(false);
        return;
      }

      setDone(true);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setErrors({ form: "We couldn't reach the studio. Check your connection and try again." });
      requestAnimationFrame(() => summaryRef.current?.focus());
      setSubmitting(false);
    }
  }

  /* --- sent --------------------------------------------------------- */
  if (done) {
    return (
      <div className="border-l-2 border-rubine bg-parchment p-8">
        <h2 ref={doneRef} tabIndex={-1} className="display-md">
          That&apos;s with Sydney.
        </h2>
        <p className="prose-editorial mt-4 text-muted">
          She reads every one herself and usually comes back within two business days with a price,
          a timeline and a yarn suggestion. Nothing is committed until you say yes.
        </p>
      </div>
    );
  }

  const errorEntries = Object.entries(errors) as Array<[keyof Values | "form", string]>;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-9">
      {/* --- error summary ---------------------------------------------- */}
      <div
        ref={summaryRef}
        tabIndex={-1}
        role="alert"
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
                  {key === "form" ? (
                    message
                  ) : (
                    <a href={`#c-${key}`} className="link">
                      {message}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {/* --- the piece ---------------------------------------------------- */}
      <fieldset>
        <legend className="display-sm mb-5">What are we making?</legend>

        <div role="radiogroup" aria-labelledby="c-pieceType-label" id="c-pieceType">
          <span id="c-pieceType-label" className="field-label">
            Kind of piece <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {PIECE_TYPES.map((type) => {
              const selected = values.pieceType === type;
              return (
                <label
                  key={type}
                  className={`cursor-pointer border px-4 py-3 text-[0.875rem] transition-colors ${
                    selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                  }`}
                >
                  <input
                    type="radio"
                    name="pieceType"
                    value={type}
                    checked={selected}
                    onChange={() => set("pieceType", type)}
                    className="sr-only"
                    {...(errors.pieceType ? { "aria-invalid": true } : {})}
                  />
                  {type}
                </label>
              );
            })}
          </div>
          {errors.pieceType ? <p className="field-error">{errors.pieceType}</p> : null}
        </div>

        <div className="mt-6">
          <label htmlFor="c-size" className="field-label">
            Rough size
          </label>
          <input
            id="c-size"
            className="field"
            value={values.size}
            onChange={(event) => set("size", event.target.value)}
            placeholder="A throw for a two-seat sofa, or 50 × 60 in"
            aria-describedby="c-size-hint"
          />
          <p id="c-size-hint" className="field-hint">
            Guessing is fine. Sydney will ask if she needs it exact.
          </p>
        </div>
      </fieldset>

      {/* --- colours ------------------------------------------------------ */}
      <fieldset>
        <legend className="field-label">Colours you&apos;re drawn to</legend>
        <div className="flex flex-wrap gap-2">
          {COLOURS.map((colour) => {
            const selected = values.colourway.includes(colour.name);
            return (
              <label
                key={colour.name}
                className={`flex cursor-pointer items-center gap-2.5 border px-4 py-3 text-[0.875rem] transition-colors ${
                  selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleColour(colour.name)}
                  className="sr-only"
                />
                {colour.hex ? (
                  <span
                    className="size-3.5 shrink-0 rounded-full border border-current/25"
                    style={{ backgroundColor: colour.hex }}
                    aria-hidden="true"
                  />
                ) : null}
                {colour.name}
              </label>
            );
          })}
        </div>
        <p className="field-hint">Pick as many as you like, or none and let her choose.</p>
      </fieldset>

      {/* --- when --------------------------------------------------------- */}
      <fieldset>
        <legend className="display-sm mb-5">When do you need it?</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="c-occasion" className="field-label">
              Occasion
            </label>
            <input
              id="c-occasion"
              className="field"
              value={values.occasion}
              onChange={(event) => set("occasion", event.target.value)}
              placeholder="Wedding, new baby, housewarming…"
            />
          </div>
          <div>
            <label htmlFor="c-neededBy" className="field-label">
              Needed by
            </label>
            <input
              id="c-neededBy"
              type="date"
              className="field"
              value={values.neededBy}
              onChange={(event) => set("neededBy", event.target.value)}
              aria-describedby="c-neededBy-hint"
            />
            <p id="c-neededBy-hint" className="field-hint">
              A blanket is about three weeks at the hook, plus shipping.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <span className="field-label" id="c-budget-label">
            Budget
          </span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="c-budget-label">
            {BUDGETS.map((budget) => {
              const selected = values.budget === budget;
              return (
                <label
                  key={budget}
                  className={`cursor-pointer border px-4 py-2.5 text-[0.875rem] transition-colors ${
                    selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                  }`}
                >
                  <input
                    type="radio"
                    name="budget"
                    value={budget}
                    checked={selected}
                    onChange={() => set("budget", budget)}
                    className="sr-only"
                  />
                  {budget}
                </label>
              );
            })}
          </div>
          <p className="field-hint">
            Saying so up front saves you both a round of email. Nothing is binding.
          </p>
        </div>
      </fieldset>

      {/* --- you ---------------------------------------------------------- */}
      <fieldset>
        <legend className="display-sm mb-5">Where to reach you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className="field-label">
              Your name <span aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="c-name"
              className="field"
              autoComplete="name"
              required
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              {...(errors.name
                ? { "aria-invalid": true as const, "aria-describedby": "c-name-error" }
                : {})}
            />
            {errors.name ? (
              <p id="c-name-error" className="field-error">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="c-email" className="field-label">
              Email <span aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              id="c-email"
              type="email"
              className="field"
              autoComplete="email"
              required
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              {...(errors.email
                ? { "aria-invalid": true as const, "aria-describedby": "c-email-error" }
                : {})}
            />
            {errors.email ? (
              <p id="c-email-error" className="field-error">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="c-phone" className="field-label">
            Phone (optional)
          </label>
          <input
            id="c-phone"
            type="tel"
            className="field"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
          />
        </div>

        <div className="mt-5">
          <label htmlFor="c-notes" className="field-label">
            Anything else
          </label>
          <textarea
            id="c-notes"
            rows={4}
            className="field resize-y"
            maxLength={1500}
            value={values.notes}
            onChange={(event) => set("notes", event.target.value)}
            placeholder="A photo you saw, a room it has to live in, a name to work into the corner…"
          />
        </div>
      </fieldset>

      <div>
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={submitting}>
          {submitting ? "Sending…" : "Send to Sydney"}
        </button>
        <p className="mt-4 max-w-[48ch] text-[0.8125rem] leading-relaxed text-muted">
          No payment now and nothing committed. Sydney reads every request herself and replies
          within about two business days.
        </p>
      </div>
    </form>
  );
}
