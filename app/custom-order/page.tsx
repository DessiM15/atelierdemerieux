import Image from "next/image";
import type { Metadata } from "next";
import { CustomOrderForm } from "@/components/custom-order-form";
import { StitchGlyph } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Custom orders",
  description:
    "Have Sydney make something that doesn't exist yet — a blanket in your colours, a christening piece, a throw to match a room. Tell her what you have in mind and she'll come back with a price and a timeline.",
};

const STEPS = [
  { title: "You tell her", body: "The form below. Five minutes, no payment, nothing committed." },
  {
    title: "She quotes",
    body: "Within about two business days: a price, a ship date, and a yarn she'd use.",
  },
  {
    title: "You decide",
    body: "If it's a yes, she sends an invoice and starts. If it isn't, that's genuinely fine.",
  },
] as const;

/**
 * SAMPLE COPY — recent custom pieces, written to show the shape of the
 * section. Replace with real past orders (and photographs) as they happen.
 */
const RECENT = [
  { piece: "Wedding throw", detail: "Ivory and sage, initials worked into one corner" },
  { piece: "Baby blanket", detail: "Dusty rose, sized for a crib, washable cotton" },
  { piece: "Team blanket", detail: "Burgundy and gold stripes for a dorm room" },
  { piece: "Sofa throw", detail: "Matched to a paint swatch mailed in an envelope" },
] as const;

export default function CustomOrderPage() {
  return (
    <>
      <section className="shell grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <StitchGlyph className="mb-6 h-6 w-auto text-rubine" loops={4} />
          <p className="eyebrow mb-4">Custom order</p>
          <h1 className="display-xl">Something that doesn&apos;t exist yet</h1>
          <p className="prose-editorial mt-6 text-muted">
            A blanket in her colours for a wedding. A christening piece with a name worked into the
            corner. A throw to match a sofa you have already bought and can&apos;t find anything for.
          </p>
          <p className="prose-editorial mt-4 text-muted">
            Custom work is most of what Sydney does. Tell her what you have in mind — it does not
            need to be fully formed — and she will come back with a price, a timeline and a yarn.
          </p>

          <ol className="mt-10 flex flex-col divide-y divide-rule border-y border-rule">
            {STEPS.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span className="numeric font-display text-xl text-camel">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="display-sm">{step.title}</h2>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal">
          <Image
            src="/products/bow-blanket-1.jpg"
            alt="A custom cream blanket covered in hand-stitched blue bows, laid across a sofa"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* =====================================================================
          Recently made — sample copy, see RECENT above.
          ===================================================================== */}
      <section aria-labelledby="recent-heading" className="shell mt-20 sm:mt-28">
        <p className="eyebrow mb-3">Recently made to order</p>
        <h2 id="recent-heading" className="display-md mb-8">
          Things people have asked for
        </h2>
        <ul className="grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((entry) => (
            <li key={entry.piece} className="bg-cream p-6 sm:p-7">
              <h3 className="font-display text-[1.125rem]">{entry.piece}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{entry.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="form-heading" className="shell-narrow mt-20 sm:mt-28">
        <h2 id="form-heading" className="display-lg mb-3">
          Tell her about it
        </h2>
        <p className="mb-10 max-w-[52ch] text-[0.9375rem] text-muted">
          Only three of these are required. Everything else just helps her quote accurately the
          first time.
        </p>
        <CustomOrderForm />
      </section>
    </>
  );
}
