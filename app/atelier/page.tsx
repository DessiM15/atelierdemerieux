import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StitchGlyph } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "The Atelier",
  description:
    "Meet Sydney, the maker behind Atelier de Merieux — and how a blanket goes from a ball of yarn to the end of your bed.",
};

/**
 * On a handmade site the maker is the brand: people are buying someone's time,
 * and this is the page where that becomes concrete. It typically draws the
 * second-most traffic after the shop and lifts conversion everywhere else, so
 * it gets the same care as a product page rather than being an afterthought.
 */

const STEPS = [
  {
    title: "The yarn comes first",
    body: "The fibre is chosen before the pattern is. Something washable for a piece that will live on a sofa with a dog on it; something softer for a blanket meant to be sat under. Getting this wrong is how a beautiful piece ends up in a cupboard.",
  },
  {
    title: "A swatch, then the maths",
    body: "Every stitch pattern works up to a different size, so each piece starts with a small square worked and measured. That square is what turns \"a throw, about 50 by 60\" into a stitch count. It also gets washed, because yarn moves.",
  },
  {
    title: "Forty hours at the hook",
    body: "There is no machine that makes crochet. Every stitch in every piece on this site was pulled through the one before it by hand. A throw is roughly three weeks of evenings — which is the honest answer to why it costs what it costs.",
  },
  {
    title: "Blocking and finishing",
    body: "The finished piece is wetted, pinned out to its true dimensions and left to dry flat. It is the least interesting day and the one that separates handmade from homemade — it is what makes the edges straight and the drape sit right.",
  },
] as const;

export default function AtelierPage() {
  return (
    <>
      {/* =====================================================================
          Portrait + introduction
          ===================================================================== */}
      <section className="shell grid items-center gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="reveal order-2 lg:order-1">
          <p className="eyebrow mb-4">The maker</p>
          <h1 className="display-xl">Sydney</h1>
          <div className="prose-editorial mt-7 flex flex-col gap-4 text-muted">
            <p>
              Atelier de Merieux is one person, a hook, and more yarn than anybody needs. Sydney
              started making blankets for people she knew, kept being asked for one more, and at
              some point it stopped being a hobby.
            </p>
            <p>
              She works to order, mostly in the evenings, mostly in plum and cream and whatever the
              season has put in front of her. If you have ever been given something that took
              somebody three weeks to make, you already understand the whole business.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">
              See what she&apos;s made
            </Link>
            <Link href="/commission" className="btn btn-secondary">
              Ask for something
            </Link>
          </div>
        </div>

        {/* The portrait is black and white; a warm tint and a low plum wash
            bring it into the house palette without touching the original file,
            so the same asset works if the treatment is ever dropped. */}
        <div className="relative order-1 overflow-hidden bg-tamarind lg:order-2">
          <Image
            src="/atelier/sydney.jpg"
            alt="Sydney, the maker behind Atelier de Merieux, seated on a velvet sofa in a wide-brimmed hat and a cream knit"
            width={960}
            height={959}
            priority
            sizes="(max-width: 1024px) 90vw, 50vw"
            className="w-full object-cover [filter:sepia(0.32)_saturate(1.15)_hue-rotate(-14deg)_contrast(1.04)]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-tamarind/18 mix-blend-multiply"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* =====================================================================
          Process
          ===================================================================== */}
      <section id="process" className="shell scroll-mt-28 pt-24 sm:pt-32">
        <div className="max-w-2xl">
          <StitchGlyph className="mb-6 h-6 w-auto text-rubine" loops={4} />
          <p className="eyebrow mb-4">How a piece is made</p>
          <h2 className="display-lg">Four steps, three weeks</h2>
          <p className="prose-editorial mt-6 text-muted">
            Not a secret, just slow. This is the actual order of operations on a blanket, and it is
            why a made-to-order piece has the lead time it does.
          </p>
        </div>

        {/* These genuinely are a sequence — each step depends on the one
            before — so they are numbered. Nothing else on the site is. */}
        <ol className="mt-12 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title} className="reveal bg-cream p-7 sm:p-9" data-reveal-delay={index * 80}>
              <p className="numeric font-display text-[2.5rem] leading-none text-camel">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="display-sm mt-4">{step.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* =====================================================================
          Standing offer
          ===================================================================== */}
      <section className="shell pt-24 sm:pt-32">
        <div className="border border-rule p-8 sm:p-12">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">A standing offer</p>
            <h2 className="display-md">
              If you want something that isn&apos;t here, ask.
            </h2>
            <p className="prose-editorial mt-5 text-muted">
              A blanket in her colours for a wedding. A christening piece with a name worked into
              the corner. A throw to match a sofa you have already bought. Tell Sydney what you have
              in mind and she will come back with a price, a timeline, and a yarn — no obligation
              either way.
            </p>
            <Link href="/commission" className="btn btn-primary mt-7">
              Start a commission
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
