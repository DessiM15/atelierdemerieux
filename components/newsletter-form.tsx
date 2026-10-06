"use client";

import { useId, useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Email capture.
 *
 * Posts to `/api/waitlist` with no product attached, which the route treats as
 * a general list signup. Wired for a real ESP later; for now the route records
 * the address and notifies Sydney.
 */
export function NewsletterForm() {
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
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Request failed");

      setStatus("done");
      setMessage("You're on the list. We'll write when something new comes off the hook.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong on our side. Try again in a moment.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <label htmlFor={inputId} className="eyebrow">
        New pieces, now and then
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-describedby={statusId}
          {...(status === "error" ? { "aria-invalid": true } : {})}
          className="
            min-h-12 min-w-0 flex-1 border border-camel/60 bg-transparent px-3.5 py-2.5
            text-[0.9375rem] text-cream placeholder:text-camel
            focus-visible:border-cream
          "
        />
        <button type="submit" className="btn btn-inverse px-5" disabled={status === "sending"}>
          {status === "sending" ? "Sending" : "Join"}
        </button>
      </div>

      {/* Always present so the live region exists before it has content —
          a region injected at the same time as its text is often missed. */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={`min-h-[1.25rem] text-[0.8125rem] ${
          status === "error" ? "text-rubine-light" : "text-camel-light"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
