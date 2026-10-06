import Link from "next/link";
import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/policies";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Atelier de Merieux targets WCAG 2.2 Level AA. What that means here, what we have done, what we know is imperfect, and how to tell us when something is wrong.",
};

/**
 * The accessibility statement.
 *
 * Worth having for its own sake, and worth having in writing: a specific,
 * dated, honest statement with a working feedback route is both what the
 * guidance asks for and what demonstrates good faith if the site is ever
 * challenged. A vague "we care about accessibility" paragraph does neither.
 *
 * It must be kept true. If a limitation listed here gets fixed, remove it; if
 * a new one appears, add it.
 */

const MEASURES = [
  {
    title: "Structure and landmarks",
    body: "Every page has one <h1>, headings that descend without skipping, and real landmarks — header, nav, main, footer — so a screen reader can jump straight to the content. A skip link is the first focusable element on every page.",
  },
  {
    title: "Keyboard, everywhere",
    body: "Everything that can be clicked can be reached and operated with a keyboard alone. The bag is a native dialog, so it traps focus, closes on Escape, and returns focus to the button that opened it. Product images and variations are arrow-key navigable.",
  },
  {
    title: "Visible focus",
    body: "Focus is always visible, with a 2px plum ring at a 3px offset that inverts on dark sections so it never vanishes. We have not removed a focus outline anywhere on the site.",
  },
  {
    title: "Contrast",
    body: "Every text and background pair in use was checked rather than assumed. Body text sits at 15:1 against the page, the plum accent at 9.6:1 — above the 4.5:1 AA threshold and past AAA. Placeholder text, which is frequently missed, clears AA too.",
  },
  {
    title: "Colour is never the only signal",
    body: "Links in body text are underlined, not just coloured. Sold-out items say sold out. Form errors are described in words, listed in a summary at the top of the form, and linked to the field they belong to.",
  },
  {
    title: "Motion",
    body: "Scroll animations are an enhancement layered on a page that is already fully visible — with JavaScript off, nothing is hidden. If your system asks for reduced motion, the animations do not run at all.",
  },
  {
    title: "Text and zoom",
    body: "Zoom is not capped or disabled. The layout reflows to 400% and to a 320px viewport without horizontal scrolling or loss of content.",
  },
  {
    title: "Forms",
    body: "Every field has a persistent visible label — never a placeholder standing in for one — plus autocomplete attributes so a browser or password manager can fill them. Required fields are marked in text as well as with an asterisk.",
  },
  {
    title: "Targets",
    body: "Interactive controls are at least 44 by 44 pixels, comfortably over the 24-pixel minimum in WCAG 2.2.",
  },
  {
    title: "Announcements",
    body: "Adding to the bag, changing a quantity, and submitting a form are announced through a polite live region, so a change that happens without a page reload is not silent.",
  },
] as const;

const LIMITATIONS = [
  {
    title: "Square's payment fields",
    body: "The card number, expiry and CVV fields are rendered by Square inside a cross-origin frame — that is what keeps your card details away from this site entirely. Their markup is Square's, not ours. We have tested that they are reachable and operable by keyboard and screen reader, but we cannot change them. If you hit a problem there, tell us and we will escalate it to Square and help you complete your order another way.",
  },
  {
    title: "Product photography",
    body: "Alt text is written by hand for every image. Photographs of texture are genuinely hard to describe, and some descriptions are better than others. If one is unhelpful, say so and we will rewrite it — that is a real fix, not a courtesy.",
  },
  {
    title: "Testing we have and have not done",
    body: "The site has been built against WCAG 2.2 AA and checked with keyboard navigation, zoom to 400%, and automated tooling. It has not yet been audited by a third party or tested with every assistive technology in use. That is planned, and this page will be updated with the results and the date.",
  },
] as const;

export default function AccessibilityPage() {
  return (
    <div className="shell-narrow pt-12 sm:pt-16">
      <header className="border-b border-rule pb-8">
        <p className="eyebrow mb-4">Accessibility</p>
        <h1 className="display-xl">Everyone gets to shop here</h1>
        <p className="prose-editorial mt-6 text-muted">
          Atelier de Merieux is built to meet{" "}
          <a
            href="https://www.w3.org/TR/WCAG22/"
            className="link"
            target="_blank"
            rel="noopener noreferrer"
          >
            WCAG 2.2 Level AA
          </a>
          <span className="sr-only"> (opens in a new tab)</span> — the standard the Department of
          Justice points to for the Americans with Disabilities Act. This page says what that meant
          in practice, what we know is still imperfect, and how to tell us when we have got
          something wrong.
        </p>
        <p className="mt-5 text-[0.8125rem] text-muted">Last reviewed 6 October 2026</p>
      </header>

      {/* --- the claim ---------------------------------------------------- */}
      <section className="pt-10">
        <h2 className="display-md">Where we stand</h2>
        <p className="prose-editorial mt-4 text-muted">
          We believe this site conforms to WCAG 2.2 Level AA, with the exceptions listed below.
          &ldquo;Believe&rdquo; is doing real work in that sentence: conformance is a claim we make
          honestly and check regularly, not a certificate anyone issues.
        </p>
        <p className="prose-editorial mt-4 text-muted">
          We have not installed an accessibility overlay — one of those widgets that adds a floating
          icon offering to fix the page for you. They do not fix underlying problems, they routinely
          interfere with the screen reader or keyboard setup you already have configured, and
          disability advocates have asked repeatedly that sites stop using them. The work is in the
          markup instead.
        </p>
      </section>

      {/* --- measures ----------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="display-md mb-6">What that meant in practice</h2>
        <dl className="flex flex-col divide-y divide-rule border-y border-rule">
          {MEASURES.map((measure) => (
            <div key={measure.title} className="py-5">
              <dt className="display-sm">{measure.title}</dt>
              <dd className="mt-2 max-w-[66ch] text-[1.0625rem] leading-relaxed text-muted">
                {measure.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --- limitations -------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="display-md mb-3">Where we fall short</h2>
        <p className="prose-editorial mb-6 text-muted">
          A statement that lists no limitations is not a statement, it is marketing. These are the
          parts we know about.
        </p>
        <dl className="flex flex-col divide-y divide-rule border-y border-rule">
          {LIMITATIONS.map((limitation) => (
            <div key={limitation.title} className="py-5">
              <dt className="display-sm">{limitation.title}</dt>
              <dd className="mt-2 max-w-[66ch] text-[1.0625rem] leading-relaxed text-muted">
                {limitation.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --- feedback ----------------------------------------------------- */}
      <section className="pt-12">
        <h2 className="display-md">Tell us</h2>
        <p className="prose-editorial mt-4 text-muted">
          If any part of this site is hard to use, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link">
            {CONTACT_EMAIL}
          </a>
          . Tell us the page and what happened — and what you were using, if you know it, because
          that usually makes the difference between a guess and a fix.
        </p>
        <p className="prose-editorial mt-4 text-muted">
          We aim to reply within two business days. If something is blocking you from buying a piece,
          say so and we will take the order over email in the meantime. Nobody should have to wait
          for a bug fix to buy a blanket.
        </p>
      </section>

      <nav aria-label="Related" className="mt-14 border-t border-rule pt-8">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>
            <Link href="/policies/shipping" className="link text-[0.9375rem]">
              Shipping
            </Link>
          </li>
          <li>
            <Link href="/policies/returns" className="link text-[0.9375rem]">
              Returns
            </Link>
          </li>
          <li>
            <Link href="/policies/privacy" className="link text-[0.9375rem]">
              Privacy
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
