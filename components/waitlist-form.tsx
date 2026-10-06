"use client";

import Link from "next/link";
import { useId, useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Back-in-stock / "make me one like it" capture.
 *
 * Shown wherever a piece can't be bought. A sold-out one-of-a-kind listing is
 * the most persuasive page on the site — someone is looking at proof the work
 * is wanted — so it collects an email and points at a commission rather than
 * being a dead end.
 */
export function WaitlistForm({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputId = useId();
  const statusId = useId();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");

    if (typeof email !== "string" || !email.includes("@")) {
      setStatus("error");
      setMessage("That doesn't look like an email address. Check it and try again.");
      return;
    }

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId, productName }),
      });
      if (!response.ok) throw new Error("Request failed");

      setStatus("done");
      setMessage(`You're on the list. We'll write the moment another ${productName} exists.`);
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong on our side. Try again in a moment.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <label htmlFor={inputId} className="field-label">
          Tell me when there's another
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="field sm:flex-1"
            aria-describedby={statusId}
            {...(status === "error" ? { "aria-invalid": true } : {})}
          />
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {status === "sending" ? "Sending" : "Notify me"}
          </button>
        </div>

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          className={`min-h-[1.25rem] text-[0.8125rem] ${
            status === "error" ? "text-rubine" : "text-muted"
          }`}
        >
          {message}
        </p>
      </form>

      <p className="text-[0.8125rem] text-muted">
        Don't want to wait?{" "}
        <Link href="/commission" className="link">
          Commission one in your colours
        </Link>
        .
      </p>
    </div>
  );
}
