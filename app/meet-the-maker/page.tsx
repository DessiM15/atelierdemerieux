import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StitchGlyph } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Meet the Maker",
  description:
    "Meet Sydney, the one pair of hands behind Atelier de Merieux — how she started, how a blanket goes from a ball of yarn to the end of your bed, and the questions people ask her most.",
};

/**
 * On a handmade site the maker is the brand: people are buying someone's time,
 * and this is the page where that becomes concrete. It typically draws the
 * second-most traffic after the shop and lifts conversion everywhere else, so
 * it gets the same care as a product page rather than being an afterthought.
 *
 * ---------------------------------------------------------------------------
 * SAMPLE COPY. Everything on this page that is specific to Sydney — where she
 * is based, when she started, the numbers, the family story, the quotes — is
 * placeholder written in the brand voice so she can see the page working and
 * react to it. Each block is marked. Replace with her real details before
 * launch; do not let any of it go live as fact.
 * ---------------------------------------------------------------------------
 */

/* SAMPLE — replace with real figures. */
const FACTS = [
  { value: "2019", label: "First blanket, for a friend's baby" },
  { value: "140+", label: "Pieces made and sent home" },
  { value: "40 hrs", label: "In an average throw" },
  { value: "1", label: "Pair of hands, start to finish" },
] as const;

/* SAMPLE — replace with Sydney's own story. */
const STORY = [
  {
    title: "How it started",
    body: "Sydney learned to crochet from her grandmother over one long winter, mostly as a way to sit together without having to talk. The first finished piece was a baby blanket for a friend. The second was for a friend of that friend. By the time she was taking payment she already had a waiting list.",
  },
  {
    title: "Why blankets",
    body: "Because they get used. A scarf lives in a drawer for nine months of the year; a blanket is on the sofa every evening, in the car on a cold morning, on the floor at the end of a long day. She likes making things that are going to be worn out rather than kept nice.",
  },
  {
    title: "The name",
    body: "Merieux is a family name from her grandmother's side, and an atelier is just a workshop — though it sounds grander than a sunroom with a very good chair in it. The name is a reminder of where the hands came from and who they were taught by.",
  },
] as const;

/* SAMPLE — replace with the real answers. */
const QUESTIONS = [
  {
    q: "Where are you based, and do you ship?",
    a: "The studio is in Charlotte, North Carolina. Everything ships across the United States, and local pickup can usually be arranged.",
  },
  {
    q: "Can I choose my own colours?",
    a: "Yes — that is most of what a custom order is. Send a paint swatch, a photograph of the room, or just the names of a few colours and Sydney will suggest a yarn to match.",
  },
  {
    q: "Can it be washed?",
    a: "Every blanket in the shop is worked in a machine-washable chenille. Cold, gentle, in a mesh bag, then laid flat or tumbled low. The small cotton pieces are the same. Only the car hangers ask to be spot cleaned.",
  },
  {
    q: "How long does a custom piece take?",
    a: "About three weeks at the hook for a throw, plus shipping. Rush work is sometimes possible for an additional fee; ask early and she will say honestly whether the date can be met.",
  },
  {
    q: "Do you teach?",
    a: "Not yet, but it comes up often enough that there may be a beginner's evening in the new year. Join the list at the bottom of the page and you will hear first.",
  },
] as const;

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

/* SAMPLE — replace with things Sydney actually keeps nearby. */
const IN_THE_STUDIO = [
  "A 9 mm hook that is older than the business",
  "A notebook of stitch counts, one page per blanket",
  "More chenille in plum than will ever be needed",
  "A sewing gauge and a spray bottle for blocking",
  "A very patient cat",
] as const;

export default function MeetTheMakerPage() {
  return (
    <>
      {/* =====================================================================
          Portrait + introduction
          ===================================================================== */}
      <section className="shell grid items-center gap-10 pt-12 sm:pt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="reveal order-2 lg:order-1">
          <p className="eyebrow mb-4">Meet the maker</p>
          <h1 className="display-xl">Hi, I&apos;m Sydney.</h1>
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
            <Link href="/custom-order" className="btn btn-secondary">
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
          By the numbers — SAMPLE figures
          ===================================================================== */}
      <section aria-label="At a glance" className="shell pt-16 sm:pt-20">
        <dl className="grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-parchment px-6 py-7 sm:px-7">
              <dd className="numeric font-display text-[2.25rem] leading-none text-rubine">
                {fact.value}
              </dd>
              <dt className="mt-3 text-[0.8125rem] uppercase tracking-[0.16em] text-muted">
                {fact.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* =====================================================================
          The story — SAMPLE copy
          ===================================================================== */}
      <section aria-labelledby="story-heading" className="shell pt-24 sm:pt-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <StitchGlyph className="mb-6 h-6 w-auto text-rubine" loops={4} />
            <p className="eyebrow mb-4">The story</p>
            <h2 id="story-heading" className="display-lg">
              One winter, one hook
            </h2>
          </div>
          <div className="grid gap-10 sm:grid-cols-1">
            {STORY.map((chapter, index) => (
              <div
                key={chapter.title}
                className="reveal grid gap-3 border-t border-rule pt-6 sm:grid-cols-[12rem_1fr] sm:gap-8"
                data-reveal-delay={index * 80}
              >
                <h3 className="display-sm">{chapter.title}</h3>
                <p className="prose-editorial text-muted">{chapter.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          Pull quote — SAMPLE
          ===================================================================== */}
      <section className="on-dark mt-24 sm:mt-32">
        <div className="shell py-20 sm:py-24">
          <figure className="mx-auto max-w-3xl text-center">
            <StitchGlyph className="mx-auto mb-8 h-6 w-auto text-camel" loops={3} />
            <blockquote className="font-display text-[clamp(1.5rem,3.2vw,2.375rem)] leading-[1.25] text-cream">
              &ldquo;I don&apos;t want to make anything that gets saved for guests. The whole point is
              that it&apos;s on the sofa every single night.&rdquo;
            </blockquote>
            <figcaption className="mt-6 text-[0.75rem] uppercase tracking-[0.22em] text-camel">
              Sydney <span aria-hidden="true">·</span> Atelier de Merieux
            </figcaption>
          </figure>
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
          In the studio + questions — SAMPLE copy
          ===================================================================== */}
      <section aria-labelledby="questions-heading" className="shell pt-24 sm:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="reveal">
            <p className="eyebrow mb-4">In the studio</p>
            <h2 className="display-md">Always within reach</h2>
            <ul className="mt-6 flex flex-col divide-y divide-rule border-y border-rule">
              {IN_THE_STUDIO.map((item) => (
                <li key={item} className="flex items-baseline gap-3 py-3.5 text-[0.9375rem] text-muted">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rubine" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 overflow-hidden bg-parchment">
              <Image
                src="/products/latte-blanket.jpg"
                alt="A crochet blanket in bands of cream, camel and dark brown with small heart motifs, spread over a cream sofa"
                width={1122}
                height={1402}
                sizes="(max-width: 1024px) 90vw, 35vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Things people ask</p>
            <h2 id="questions-heading" className="display-md">
              The usual questions
            </h2>
            <dl className="mt-6 flex flex-col divide-y divide-rule border-y border-rule">
              {QUESTIONS.map((entry, index) => (
                <div key={entry.q} className="reveal py-6" data-reveal-delay={index * 60}>
                  <dt className="display-sm">{entry.q}</dt>
                  <dd className="mt-2.5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted">
                    {entry.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* =====================================================================
          Standing offer
          ===================================================================== */}
      <section className="shell pt-24 sm:pt-32">
        <div className="border border-rule p-8 sm:p-12">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">A standing offer</p>
            <h2 className="display-md">If you want something that isn&apos;t here, ask.</h2>
            <p className="prose-editorial mt-5 text-muted">
              A blanket in her colours for a wedding. A christening piece with a name worked into
              the corner. A throw to match a sofa you have already bought. Tell Sydney what you have
              in mind and she will come back with a price, a timeline, and a yarn — no obligation
              either way.
            </p>
            <Link href="/custom-order" className="btn btn-primary mt-7">
              Start a custom order
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
