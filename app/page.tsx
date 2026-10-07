import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { availabilityOf, getCategories, getProducts, lowestPrice, scarcityNote } from "@/lib/square/catalog";
import { FALL_COLLECTION } from "@/lib/collections";
import { ProductCard } from "@/components/product-card";
import { HeroCarousel, type HeroSlide } from "@/components/hero-carousel";
import { StitchGlyph } from "@/components/wordmark";
import { SHIPPING } from "@/lib/shipping";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = {
  // The template adds the house name, so this stays short.
  title: "Handmade crochet, worked one piece at a time",
};

/** One representative photograph per category tile, in category order. */
const CATEGORY_IMAGES = [
  {
    src: "/products/olive-blanket.jpg",
    alt: "A deep olive-green chunky crochet blanket draped over a cream armchair",
  },
  {
    src: "/products/rose-coasters.jpg",
    alt: "Cream crochet coasters edged with small red roses on a marble table",
  },
  {
    src: "/products/tulip-mirror-hanger.jpg",
    alt: "A crochet hanger of pale pink tulips swinging from a car's rear-view mirror",
  },
] as const;

/**
 * SAMPLE COPY. These are stand-in reviews written to show Sydney where real
 * ones will sit and how long they should be. Replace with genuine customer
 * words (with permission) before launch — never ship invented reviews.
 */
const KIND_WORDS = [
  {
    quote:
      "It is heavier than I expected and that is exactly the point. Nobody in this house has sat on the sofa without it since.",
    name: "Hannah R.",
    piece: "The Olive Blanket",
  },
  {
    quote:
      "I sent her a photo of the nursery and a due date. What came back matched the paint, and arrived a week early.",
    name: "Marcus T.",
    piece: "Custom baby blanket",
  },
  {
    quote:
      "The bows are stitched on one at a time and you can tell. It looks like something that was made, not bought.",
    name: "Elena P.",
    piece: "The Bow Blanket",
  },
  {
    quote:
      "Washed it twice already — once because of the dog — and it came out exactly as it went in. Softer, if anything.",
    name: "Jordan W.",
    piece: "The Latte Blanket",
  },
] as const;

const WAYS = [
  {
    eyebrow: "On the shelf",
    title: "Ready to ship",
    body: "Small pieces and the occasional one-of-a-kind blanket, finished and waiting. Leaves within one business day.",
    href: "/shop",
    cta: "Shop what's ready",
  },
  {
    eyebrow: "Started when you order",
    title: "Made to order",
    body: "The blankets in the collection. Nothing is on a shelf — your order starts the work, and it ships in about three weeks.",
    href: "/shop/category/blankets-and-throws",
    cta: "See the blankets",
  },
  {
    eyebrow: "Made for you",
    title: "Custom order",
    body: "Your colours, your size, a name in the corner. Tell Sydney what you have in mind and she quotes within two business days.",
    href: "/custom-order",
    cta: "Start a custom order",
  },
] as const;

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  // The hero slides carry the live price and availability of the product they
  // point at, so the first thing on the page never disagrees with the shop.
  const slides: HeroSlide[] = FALL_COLLECTION.slides.map((slide) => {
    const product = products.find((entry) => entry.slug === slide.slug);
    if (!product) return slide;
    const availability = availabilityOf(product);
    const price = lowestPrice(product);
    const hasVariants = product.variations.length > 1;
    const note =
      availability === "sold-out"
        ? "Sold"
        : (scarcityNote(product) ??
          (product.leadTime
            ? `Made to order · ${product.leadTime.minDays}–${product.leadTime.maxDays} days`
            : "Ready to ship"));
    return {
      ...slide,
      price: `${hasVariants ? "From " : ""}${formatMoney(price)}`,
      note,
    };
  });

  const inCollection = new Set(FALL_COLLECTION.slides.map((slide) => slide.slug));
  const featured = products.filter((product) => !inCollection.has(product.slug)).slice(0, 3);

  return (
    <>
      {/* =====================================================================
          Hero — the fall blankets, full bleed, one at a time.
          ===================================================================== */}
      <HeroCarousel
        eyebrow={FALL_COLLECTION.eyebrow}
        title={FALL_COLLECTION.title}
        slides={slides}
        shopHref={FALL_COLLECTION.href}
      />

      {/* A quiet strip of the practical things, so they are not fighting the
          photographs for attention in the hero itself. */}
      <div className="border-b border-rule bg-parchment">
        <div className="shell flex flex-wrap items-center justify-center gap-x-10 gap-y-2 py-3.5 text-center text-[0.75rem] uppercase tracking-[0.18em] text-muted">
          <span>Free shipping over {formatMoney(SHIPPING.freeThreshold)}</span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>Pay in 4 with Afterpay</span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span>Made by hand, one at a time</span>
        </div>
      </div>

      {/* =====================================================================
          Featured — the small things, since the blankets had the hero.
          ===================================================================== */}
      <section aria-labelledby="featured-heading" className="shell pt-20 sm:pt-28">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <p className="eyebrow mb-3">On the shelf now</p>
          <h2 id="featured-heading" className="display-lg">
            Ready to go home
          </h2>
          <Link href="/shop" className="nav-link mt-5">
            See everything
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <p className="prose-editorial text-muted">
            The shop is being set up. Come back shortly, or{" "}
            <Link href="/custom-order" className="link">
              place a custom order
            </Link>{" "}
            in the meantime.
          </p>
        )}
      </section>

      {/* =====================================================================
          How ordering works — the three ways to get a piece, in plain words.
          ===================================================================== */}
      <section aria-labelledby="ways-heading" className="shell pt-24 sm:pt-32">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">How it works</p>
          <h2 id="ways-heading" className="display-lg">
            Three ways to get a piece
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-3">
          {WAYS.map((way, index) => (
            <li
              key={way.title}
              className="reveal flex flex-col bg-cream p-7 text-center sm:p-9"
              data-reveal-delay={index * 80}
            >
              <p className="eyebrow mb-4">{way.eyebrow}</p>
              <h3 className="display-sm">{way.title}</h3>
              <p className="mx-auto mt-3 max-w-[34ch] flex-1 text-[0.9375rem] leading-relaxed text-muted">
                {way.body}
              </p>
              <Link href={way.href} className="nav-link mx-auto mt-6">
                {way.cta}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* =====================================================================
          The craft — the editorial beat. This is where the site slows down,
          and the only place it is allowed to.
          ===================================================================== */}
      <section aria-labelledby="craft-heading" className="shell pt-24 sm:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal order-2 flex flex-col items-center text-center lg:order-1">
            <StitchGlyph className="mb-7 h-6 w-auto text-rubine" loops={4} />
            <p className="eyebrow mb-4">Made by hand, made to last</p>
            <h2 id="craft-heading" className="display-lg">
              Made to be used every day.
            </h2>
            <div className="prose-editorial mt-6 flex flex-col gap-4 text-muted">
              <p>
                Every piece here is worked by hand, one stitch at a time, in a soft chenille chosen
                because it holds its shape, keeps its colour, and goes through the wash without
                complaint. These are blankets for the sofa, the car and the end of a long day — not
                for the back of a cupboard.
              </p>
              <p>
                The edges are finished so they stay straight, the stitch is dense enough to be
                warm, and the yarn is forgiving of dogs, children and spilled coffee. Made slowly,
                so it can be loved quickly and for a long time.
              </p>
            </div>
            <Link href="/meet-the-maker#process" className="btn btn-ghost mt-8">
              How a piece is made
            </Link>
          </div>

          <div className="reveal order-1 lg:order-2">
            <Image
              src="/products/bow-blanket-2.jpg"
              alt="A cream crochet blanket covered in hand-stitched blue bows, folded across the end of a bed"
              width={1122}
              height={1402}
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          Categories
          ===================================================================== */}
      {categories.length > 0 ? (
        <section aria-labelledby="categories-heading" className="shell pt-24 sm:pt-32">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow mb-3">Browse</p>
            <h2 id="categories-heading" className="display-lg">
              By what it&apos;s for
            </h2>
          </div>

          <ul className="grid gap-6 sm:grid-cols-3">
            {categories.slice(0, 3).map((category, index) => (
              <li key={category.id} className="reveal" data-reveal-delay={index * 90}>
                <Link href={`/shop/category/${category.slug}`} className="group block">
                  <div className="overflow-hidden bg-parchment">
                    <Image
                      src={CATEGORY_IMAGES[index % 3]!.src}
                      alt={CATEGORY_IMAGES[index % 3]!.alt}
                      width={1122}
                      height={1402}
                      sizes="(max-width: 640px) 90vw, 30vw"
                      className="
                        aspect-[3/2] w-full object-cover
                        transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,0.61,0.36,1)]
                        group-hover:scale-[1.03]
                      "
                    />
                  </div>
                  <h3 className="display-sm mt-4">{category.name}</h3>
                  {category.blurb ? (
                    <p className="mt-1.5 max-w-[32ch] text-[0.9375rem] text-muted">
                      {category.blurb}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* =====================================================================
          Kind words — sample copy, see KIND_WORDS above.
          ===================================================================== */}
      <section aria-labelledby="words-heading" className="shell pt-24 sm:pt-32">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-3">Kind words</p>
          <h2 id="words-heading" className="display-lg">
            From the people who have one
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
          {KIND_WORDS.map((entry, index) => (
            <li
              key={entry.quote}
              className="reveal flex flex-col justify-between gap-6 bg-cream p-6 sm:p-7"
              data-reveal-delay={index * 80}
            >
              <div>
                <p className="mb-4 flex gap-0.5 text-rubine" aria-label="Five out of five stars">
                  {Array.from({ length: 5 }, (_, star) => (
                    <svg
                      key={star}
                      viewBox="0 0 20 20"
                      className="size-3.5"
                      fill="currentColor"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
                    </svg>
                  ))}
                </p>
                <blockquote className="font-serif text-[1.125rem] leading-[1.5] text-ink">
                  &ldquo;{entry.quote}&rdquo;
                </blockquote>
              </div>
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                {entry.name} <span aria-hidden="true">·</span> {entry.piece}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* =====================================================================
          Custom order — the highest-margin thing Sydney sells, given a full
          band rather than a footer link.
          ===================================================================== */}
      <section aria-labelledby="custom-heading" className="on-dark mt-24 sm:mt-32">
        <div className="shell grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col items-center text-center">
            <p className="eyebrow mb-4">Made for you</p>
            <h2 id="custom-heading" className="display-md">
              Something that doesn&apos;t exist yet
            </h2>
            <p className="prose-editorial mt-5 text-camel-light">
              A blanket in her colours for a wedding. A christening piece with a name worked into the
              corner. Tell Sydney what you have in mind and she will come back with a price, a
              timeline, and a yarn.
            </p>
            <Link href="/custom-order" className="btn btn-inverse mt-7">
              Start a custom order
            </Link>
          </div>

          {/* Stock photograph (CC0, via rawpixel) until Sydney has one of her
              own yarn in progress. */}
          <div className="reveal mx-auto w-full max-w-[32rem]">
            <Image
              src="/stock/rust-wool.jpg"
              alt="A single ball of burnt-rust wool resting on soft striped bedding"
              width={1024}
              height={683}
              sizes="(max-width: 1024px) 90vw, 32rem"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
