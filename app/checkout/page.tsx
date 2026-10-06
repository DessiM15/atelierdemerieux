import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";

export const metadata: Metadata = {
  title: "Checkout",
  // A checkout page has no business in a search index.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  const applicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID ?? "";
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ?? "";
  const environment =
    process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";

  return (
    <div className="shell pt-10 sm:pt-14">
      <header className="mb-10">
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="display-lg">Nearly yours</h1>
        <p className="mt-4 max-w-[46ch] text-[0.9375rem] text-muted">
          Everything happens here — you won&apos;t be sent anywhere else to pay.{" "}
          <Link href="/shop" className="link">
            Keep shopping
          </Link>
          .
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <CheckoutForm
          applicationId={applicationId}
          locationId={locationId}
          environment={environment}
        />

        <aside aria-labelledby="order-summary-heading" className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="order-summary-heading" className="display-sm mb-5">
            Your order
          </h2>
          <CheckoutSummary />
        </aside>
      </div>
    </div>
  );
}
