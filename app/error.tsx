"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="shell-narrow flex flex-col items-start gap-6 py-24 sm:py-32">
      <h1 className="display-lg">Something went wrong at our end.</h1>
      <p className="prose-editorial text-muted">
        Not your fault, and nothing in your bag has been lost. Try again, and if it keeps happening
        write to us and we will sort it out.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Back to the start
        </Link>
      </div>
      {error.digest ? (
        <p className="numeric text-[0.75rem] text-muted">Reference: {error.digest}</p>
      ) : null}
    </div>
  );
}
