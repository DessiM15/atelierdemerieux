import Link from "next/link";
import { StitchGlyph, WordmarkInline } from "./wordmark";
import { NewsletterForm } from "./newsletter-form";
import { SHIPPING } from "@/lib/shipping";
import { formatMoney } from "@/lib/money";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "Everything" },
      { href: "/shop/category/blankets-and-throws", label: "Blankets & Throws" },
      { href: "/shop/category/for-the-home", label: "For the Home" },
      { href: "/shop/category/small-things", label: "Small Things" },
      { href: "/custom-order", label: "Start a custom order" },
    ],
  },
  {
    heading: "The Maker",
    links: [
      { href: "/meet-the-maker", label: "Meet Sydney" },
      { href: "/meet-the-maker#process", label: "How a piece is made" },
      { href: "/policies/care", label: "Care & fibre" },
    ],
  },
  {
    heading: "Help",
    links: [
      { href: "/policies/shipping", label: "Shipping" },
      { href: "/policies/returns", label: "Returns" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/policies/privacy", label: "Privacy" },
      { href: "/policies/terms", label: "Terms" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark mt-24 sm:mt-32">
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          {/* --- identity + newsletter ------------------------------- */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <StitchGlyph className="h-7 w-auto text-camel" loops={3} />
              <WordmarkInline className="text-cream" />
            </div>
            <p className="max-w-[34ch] font-serif text-lg leading-relaxed text-camel-light">
              Handmade blankets and small goods, worked one at a time in plum, taupe and cream.
            </p>
            <NewsletterForm />
          </div>

          {/* --- link columns ---------------------------------------- */}
          <nav aria-label="Footer" className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="eyebrow mb-4">{column.heading}</h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-[0.9375rem] text-cream/85 underline-offset-4 hover:text-cream hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <hr className="hairline my-12" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-camel">
            &copy; {year} Atelier de Merieux. Every piece made by hand.
          </p>
          <p className="text-[0.8125rem] text-camel">
            Free shipping over {formatMoney(SHIPPING.freeThreshold)} &nbsp;·&nbsp; Secure checkout by
            Square
          </p>
        </div>
      </div>
    </footer>
  );
}
