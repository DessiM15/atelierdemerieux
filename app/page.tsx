import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { availabilityOf, getCategories, getProducts, lowestPrice, scarcityNote } from "@/lib/square/catalog";
import { FALL_COLLECTION } from "@/lib/collections";
import { ProductCard } from "@/components/product-card";
import { ProductMedia, WovenTile } from "@/components/product-media";
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
    name: "Sample review",
    piece: "The Olive Blanket",
  },
  {
    quote:
      "I sent her a photo of the nursery and a due date. What came back matched the paint, and arrived a week early.",
    name: "Sample review",
    piece: "Custom baby blanket",
  },
  {
    quote:
      "The bows are stitched on one at a time and you can tell. It looks like something that was made, not bought.",
    name: "Sample review",
    piece: "The Bow Blanket",
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
  const portrait = products.find((product) => product.slug === "the-bow-blanket") ?? products[0];

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
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">On the shelf now</p>
            <h2 id="featured-heading" className="display-lg">
              Ready to go home
            </h2>
          </div>
          <Link href="/shop" className="nav-link">
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
          The craft — the editorial beat. This is where the site slows down,
          and the only place it is allowed to.
          ===================================================================== */}
      <section aria-labelledby="craft-heading" className="shell pt-24 sm:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal order-2 lg:order-1">
            <StitchGlyph className="mb-7 h-6 w-auto text-rubine" loops={4} />
            <p className="eyebrow mb-4">Why it costs what it costs</p>
            <h2 id="craft-heading" className="display-lg">
              A throw is about forty hours.
            </h2>
            <div className="prose-editorial mt-6 flex flex-col gap-4 text-muted">
              <p>
                There is no machine that makes crochet. Every stitch in every piece on this site was
                pulled through the one before it by hand, which is why a blanket takes three weeks
                and why no two are quite identical.
              </p>
              <p>
                The yarn is chosen before the pattern is. Cotton for the pieces that will be washed
                often, a chenille for the ones meant to be sat under. What you are paying for is the
                time, and the fact that it was spent on your piece specifically.
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
          <p className="eyebrow mb-3">Browse</p>
          <h2 id="categories-heading" className="display-lg mb-10">
            By what it&apos;s for
          </h2>

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
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-3">Kind words</p>
          <h2 id="words-heading" className="display-lg">
            From the people who have one
          </h2>
        </div>
        <ul className="grid gap-px overflow-hidden border border-rule bg-rule md:grid-cols-3">
          {KIND_WORDS.map((entry, index) => (
            <li
              key={entry.quote}
              className="reveal flex flex-col justify-between gap-8 bg-cream p-7 sm:p-9"
              data-reveal-delay={index * 80}
            >
              <blockquote className="font-serif text-[1.25rem] leading-[1.5] text-ink">
                <StitchGlyph className="mb-5 h-5 w-auto text-camel" loops={2} />
                &ldquo;{entry.quote}&rdquo;
              </blockquote>
              <p className="text-[0.75rem] uppercase tracking-[0.18em] text-muted">
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
        <div className="shell grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Made for you</p>
            <h2 id="custom-heading" className="display-lg">
              Something that doesn&apos;t exist yet
            </h2>
            <p className="prose-editorial mt-6 text-camel-light">
              A blanket in her colours for a wedding. A christening piece with a name worked into the
              corner. Tell Sydney what you have in mind and she will come back with a price, a
              timeline, and a yarn.
            </p>
            <Link href="/custom-order" className="btn btn-inverse mt-8">
              Start a custom order
            </Link>
          </div>

          <div className="reveal">
            {portrait ? (
              <ProductMedia
                image={portrait.images[0]}
                productName={portrait.name}
                decorative
                className="aspect-[4/5] w-full object-cover"
                sizes="(max-width: 1024px) 90vw, 40vw"
              />
            ) : (
              <WovenTile tone="camel" className="aspect-[4/5] w-full object-cover" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
