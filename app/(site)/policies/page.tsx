import Link from "next/link";
import type { Metadata } from "next";
import { policies } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Policies",
  description:
    "Shipping, returns, care, privacy and terms for Atelier de Merieux — written plainly, in one place.",
};

export default function PoliciesPage() {
  return (
    <div className="shell-narrow pt-12 sm:pt-16">
      <header className="max-w-2xl">
        <p className="eyebrow mb-4">The small print</p>
        <h1 className="display-xl">Policies</h1>
        <p className="prose-editorial mt-6 text-muted">
          Written to be read rather than skipped. If something here is unclear, that is our fault —
          write and ask.
        </p>
      </header>

      <ul className="mt-12 flex flex-col divide-y divide-rule border-y border-rule">
        {policies.map((policy) => (
          <li key={policy.slug}>
            <Link href={`/policies/${policy.slug}`} className="group block py-6">
              <h2 className="display-sm transition-colors group-hover:text-rubine">
                {policy.title}
              </h2>
              <p className="mt-1.5 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted">
                {policy.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
