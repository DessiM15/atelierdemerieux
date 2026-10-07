import type { Metadata } from "next";
import { ConfirmationDetails } from "@/components/checkout/confirmation-details";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return (
    <div className="shell-narrow pt-16 sm:pt-24">
      <ConfirmationDetails />
    </div>
  );
}
