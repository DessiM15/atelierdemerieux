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
  {
    title: "You tell her",
    body: "The form below. Five minutes, no payment, nothing committed. A photo of the room or a paint swatch helps more than you would think.",
  },
  {
    title: "She quotes",
    body: "Within about two business days you get a price, a ship date, and the yarn she would use — usually with a photograph of it so there are no surprises.",
  },
  {
    title: "You decide",
    body: "If it's a yes, she sends an invoice and the three weeks start the day it is paid. If it isn't, that's genuinely fine, and she will say so too if she can't do it well.",
  },
] as const;

/**
 * SAMPLE COPY — a pricing guide, written to show the shape of the section and
 * to set expectations before the form. Replace with Sydney's real ranges.
 */
const GUIDE = [
  { piece: "Throw · 50 × 60 in", range: "$225 – $295", note: "About three weeks" },
  { piece: "Oversized · 60 × 80 in", range: "$325 – $395", note: "About four weeks" },
  { piece: "Baby blanket · 36 × 36 in", range: "$125 – $165", note: "About two weeks" },
  { piece: "Pillow cover · 18 or 20 in", range: "$65 – $95", note: "About a week" },
  { piece: "Lettering or a motif", range: "+ $40 – $90", note: "Depends on the size" },
] as const;

/**
 * SAMPLE COPY — recent custom pieces, written to show the shape of the
 * section. Replace with real past orders (and photographs) as they happen.
 */
const RECENT = [
  { piece: "Wedding throw", detail: "Ivory and sage, initials and the date worked into one corner" },
  { piece: "Baby blanket", detail: "Dusty rose, sized for a crib, in a washable cotton" },
  { piece: "Team blanket", detail: "Burgundy and gold stripes for a dorm room, finished before move-in" },
  { piece: "Sofa throw", detail: "Matched to a paint swatch mailed in an envelope" },
] as const;

export default function CustomOrderPage() {
  return (
    <div>
      <section className="shell grid gap-10 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <StitchGlyph className="mb-6 h-6 w-auto text-rubine" loops={4} />
          <p className="eyebrow mb-4">Custom order</p>
          <h1 className="display-xl">Something that doesn&apos;t exist yet</h1>
          <div className="prose-editorial mt-6 flex flex-col gap-4 text-muted">
            <p>
              A blanket in her colours for a wedding. A christening piece with a name worked into
              the corner. A throw to match a sofa you have already bought and can&apos;t find
              anything for. A smaller version of something you saw in the shop, or the same thing
              in a colour that isn&apos;t there.
            </p>
            <p>
              Custom work is most of what Sydney does, and it is the part she likes best. Tell her
              what you have in mind — it does not need to be fully formed, and &ldquo;something
              warm for my mother, she likes green&rdquo; is a perfectly good brief — and she will
              come back with a price, a timeline and a yarn.
            </p>
            <p>
              Everything is made in the same machine-washable chenille as the shop pieces unless
              you ask for something else. Cotton is available for baby pieces and anything that
              will be washed often.
            </p>
          </div>

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

        {/* Stock photograph (CC0, via rawpixel) standing in until Sydney has a
            shot of her own yarn wall. Chosen because colour choice is the
            whole point of this page. */}
        <div className="reveal">
          <Image
            src="/stock/yarn-colours.jpg"
            alt="Dozens of balls of cotton yarn stacked together in creams, rusts, olives, blues and pinks"
            width={1024}
            height={746}
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="aspect-[4/5] w-full object-cover"
          />
          <p className="mt-3 text-[0.75rem] uppercase tracking-[0.16em] text-muted">
            Pick a colour. Any colour.
          </p>
        </div>
      </section>

      {/* =====================================================================
          Pricing guide — sample copy, see GUIDE above.
          ===================================================================== */}
      <section aria-labelledby="guide-heading" className="shell mt-20 sm:mt-28">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow mb-3">Before you ask</p>
          <h2 id="guide-heading" className="display-md">
            Roughly what things cost
          </h2>
          <p className="prose-editorial mx-auto mt-5 text-muted">
            So nobody has to be embarrassed by the quote. These are starting points — the final
            price depends on size, yarn and how much detail is in the work.
          </p>
        </div>
        <dl className="mx-auto max-w-3xl divide-y divide-rule border-y border-rule">
          {GUIDE.map((row) => (
            <div
              key={row.piece}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[1fr_auto_10rem]"
            >
              <dt className="font-display text-[1.0625rem]">{row.piece}</dt>
              <dd className="numeric text-[0.9375rem]">{row.range}</dd>
              <dd className="col-span-2 text-[0.8125rem] uppercase tracking-[0.14em] text-muted sm:col-span-1 sm:text-right">
                {row.note}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* =====================================================================
          Recently made — sample copy, see RECENT above.
          ===================================================================== */}
      <section aria-labelledby="recent-heading" className="shell mt-20 sm:mt-28">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow mb-3">Recently made to order</p>
          <h2 id="recent-heading" className="display-md">
            Things people have asked for
          </h2>
        </div>
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
        <h2 id="form-heading" className="display-lg mb-3 text-center">
          Tell her about it
        </h2>
        <p className="mx-auto mb-10 max-w-[52ch] text-center text-[0.9375rem] text-muted">
          Only three of these are required. Everything else just helps her quote accurately the
          first time.
        </p>
        <CustomOrderForm />
      </section>
    </div>
  );
}
