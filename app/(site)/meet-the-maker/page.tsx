import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { StitchGlyph } from "@/components/wordmark";

export const metadata: Metadata = {
  title: "Meet the Maker",
  description:
    "Meet Sydney, the one pair of hands behind Atelier de Merieux — how she learned, why she makes blankets, how a piece goes from a ball of yarn to the end of your bed, and the questions people ask her most.",
};

/**
 * On a handmade site the maker is the brand: people are buying someone's time,
 * and this is the page where that becomes concrete. It typically draws the
 * second-most traffic after the shop and lifts conversion everywhere else, so
 * it gets the same care as a product page rather than being an afterthought.
 *
 * ---------------------------------------------------------------------------
 * SAMPLE COPY. Everything on this page that is specific to Sydney — the
 * biography, where she is based, the family story, the quotes, the answers —
 * is placeholder written in the brand voice so she can see the page working
 * and react to it. Replace with her real words before launch; do not let any
 * of it go live as fact.
 * ---------------------------------------------------------------------------
 */

/* SAMPLE — the bio, in Sydney's own voice. Replace with hers. */
const BIO = [
  "I learned to crochet the way most people do: badly, from somebody patient. My grandmother sat me down one winter when I was nine with a plastic hook and a ball of acrylic the colour of a traffic cone, and showed me a chain stitch over and over until my hands stopped asking my brain for permission. I made a scarf that was wider at one end than the other. She wore it anyway.",
  "I put the hook down for most of my twenties and picked it back up during a stretch when I needed something to do with my hands that was not a phone. I made a blanket for a friend's new baby — cream, with a border I was very proud of — and she sent me a photograph of it on the nursery floor with the baby asleep on it. I think that photograph is the reason there is a business. Somebody else asked for one. Then somebody asked for one in their wedding colours. Then somebody I had never met asked how much, and I had to sit down and work out what my evenings were worth.",
  "Atelier de Merieux is still one person. I choose the yarn, I work every stitch, I block and finish every piece, I wrap it, and I take it to the post office. I work mostly in the evenings, mostly from a sunroom that was never meant to hold this much yarn, mostly in the colours you see on this site — plum, cream, camel, the occasional olive when the season asks for it. I take on a handful of custom pieces a month and make a small number of ready-to-ship things in between, which is why the shop is never very full and why what is there is genuinely all there is.",
  "The name is my grandmother's. She would have found the French a bit much. She would also have told you, correctly, that an atelier is just a workshop, and that the most important thing in it is the chair.",
] as const;

/* SAMPLE — replace with Sydney's own story. */
const STORY = [
  {
    title: "Why blankets, specifically",
    body: "Because they get used. A scarf lives in a drawer for nine months of the year and a hat gets lost in the first. A blanket is on the sofa every evening, in the car on a cold morning, on the floor at the end of a long day with a child asleep on it. I like making the thing that is going to be worn thin rather than kept nice. The best message I ever got about a piece was a photograph of it, three years on, with a hole in one corner and a note that said they were not sending it back for repair because the dog would not forgive them.",
  },
  {
    title: "Why made to order",
    body: "A blanket is about forty hours. If I made them ahead and hoped, I would spend most of my time guessing what colour people want and most of my money on yarn for things nobody has asked for. Working to order means the piece you receive was made because you wanted it, in the colours you wanted, and started the day you said yes. The cost of that is patience — about three weeks of it — and I would rather ask you for patience than ask you to pay for my guessing.",
  },
  {
    title: "Made to last",
    body: "Everything is worked in a chenille I chose after trying a lot of others: soft enough to sleep under, dense enough to be warm, and tough enough to go through the washing machine without pilling or fading. The edges are finished so they stay straight and the corners stay square. I want a piece from here to look the same on its hundredth evening as it did on its first — and if it ever does not, I want to hear about it, because I would rather mend it than have it put away.",
  },
] as const;

/* SAMPLE — replace with the real answers. */
const QUESTIONS = [
  {
    q: "Where are you based, and do you ship?",
    a: "The studio is in Charlotte, North Carolina. Everything ships across the United States with tracking, and local pickup can usually be arranged if you are nearby — just say so in the notes.",
  },
  {
    q: "Can I choose my own colours?",
    a: "Yes — that is most of what a custom order is. Send a paint swatch, a photograph of the room, or just the names of a few colours and I will suggest a yarn to match. If you would rather leave it to me, tick \"Sydney's choice\" and tell me about the room.",
  },
  {
    q: "Can it be washed?",
    a: "Every blanket in the shop is worked in a machine-washable chenille. Cold, gentle, in a mesh bag, then laid flat or tumbled low. The small cotton pieces are the same. Only the car hangers ask to be spot cleaned, and only because of the wire in the stem.",
  },
  {
    q: "How long does a custom piece take?",
    a: "About three weeks at the hook for a throw, plus shipping, from the day the invoice is paid. Rush work is sometimes possible for an additional fee — ask early and I will say honestly whether the date can be met rather than promise and miss.",
  },
  {
    q: "Do you take returns?",
    a: "Ready-to-ship pieces, yes, within fourteen days in the condition they arrived. Custom pieces are final, because they were made to a specification only you asked for — but if something is wrong with the work itself, I will put it right. The full policy is linked in the footer.",
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
    title: "Three weeks at the hook",
    body: "There is no machine that makes crochet. Every stitch in every piece on this site was pulled through the one before it by hand. A throw is roughly three weeks of evenings, and you can feel every one of them in the weight of it.",
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
  "A kitchen timer, because forty hours has to be counted somehow",
  "A very patient cat",
] as const;

export default function MeetTheMakerPage() {
  return (
    <>
      {/* =====================================================================
          Portrait + introduction
          ===================================================================== */}
      <section className="shell grid items-start gap-10 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div className="reveal order-2 lg:order-1">
          <p className="eyebrow mb-4">Meet the maker</p>
          <h1 className="display-xl">Hi, I&apos;m Sydney.</h1>
          <div className="prose-editorial mt-7 flex flex-col gap-5 text-muted">
            {BIO.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">
              See what I&apos;ve made
            </Link>
            <Link href="/custom-order" className="btn btn-secondary">
              Ask for something
            </Link>
          </div>
        </div>

        {/* The portrait is black and white; a warm tint and a low plum wash
            bring it into the house palette without touching the original file,
            so the same asset works if the treatment is ever dropped. */}
        <div className="relative order-1 overflow-hidden bg-tamarind lg:sticky lg:top-28 lg:order-2">
          <Image
            src="/atelier/sydney.jpg"
            alt="Sydney, the maker behind Atelier de Merieux, seated on a velvet sofa in a wide-brimmed hat and a cream knit"
            width={960}
            height={959}
            priority
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="w-full object-cover [filter:sepia(0.32)_saturate(1.15)_hue-rotate(-14deg)_contrast(1.04)]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-tamarind/18 mix-blend-multiply"
            aria-hidden="true"
          />
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
          The thinking — SAMPLE copy
          ===================================================================== */}
      <section aria-labelledby="story-heading" className="shell pt-24 sm:pt-32">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <StitchGlyph className="mb-6 h-6 w-auto text-rubine" loops={4} />
          <p className="eyebrow mb-4">The thinking</p>
          <h2 id="story-heading" className="display-lg">
            Three things I get asked about at markets
          </h2>
        </div>
        <div className="mx-auto flex max-w-4xl flex-col">
          {STORY.map((chapter, index) => (
            <div
              key={chapter.title}
              className="reveal grid gap-3 border-t border-rule py-8 sm:grid-cols-[14rem_1fr] sm:gap-10 lg:py-10"
              data-reveal-delay={index * 80}
            >
              <h3 className="display-sm">{chapter.title}</h3>
              <p className="prose-editorial text-muted">{chapter.body}</p>
            </div>
          ))}
          <hr className="hairline" />
        </div>
      </section>

      {/* =====================================================================
          Process
          ===================================================================== */}
      <section id="process" className="shell scroll-mt-28 pt-24 sm:pt-32">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
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
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <p className="eyebrow mb-4">A standing offer</p>
            <h2 className="display-md">If you want something that isn&apos;t here, ask.</h2>
            <p className="prose-editorial mt-5 text-muted">
              A blanket in your colours for a wedding. A christening piece with a name worked into
              the corner. A throw to match a sofa you have already bought. Tell me what you have in
              mind and I will come back with a price, a timeline, and a yarn — no obligation either
              way.
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
