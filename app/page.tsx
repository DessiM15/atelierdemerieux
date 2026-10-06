import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/square/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductMedia, WovenTile } from "@/components/product-media";
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
    src: "/products/autumn-blanket.jpg",
    alt: "A chunky crochet blanket in blocks of cream and burnt rust, draped across a sofa",
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

export default async function HomePage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const featured = products.slice(0, 3);
  const portrait = products[3];

  return (
    <>
      {/* =====================================================================
          Hero — atmospheric, but the shop is one tap away from the first
          frame. Sized to its content rather than to 100vh, so the featured
          row breaks the fold on every screen and nobody has to scroll to
          discover that this is a store.
          ===================================================================== */}
      <section className="relative">
        <div className="grid items-stretch lg:grid-cols-[1.05fr_1fr]">
          <div className="order-2 flex flex-col justify-center px-[var(--spacing-gutter)] py-16 sm:py-24 lg:order-1 lg:py-32">
            <div className="max-w-[34rem]">
              <p className="eyebrow mb-7">Handmade in small batches</p>

              <h1 className="display-xl">
                Worked slowly,
                <br />
                in plum and cream.
              </h1>

              <p className="prose-editorial mt-7 text-muted">
                Blankets heavy enough to stay where you put them, and small things that make a room
                feel finished. Every piece is made by one pair of hands — most of them only once.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-primary">
                  Shop the atelier
                </Link>
                <Link href="/commission" className="btn btn-secondary">
                  Commission a piece
                </Link>
              </div>

              <p className="mt-6 text-[0.8125rem] text-muted">
                Free shipping over {formatMoney(SHIPPING.freeThreshold)} · Pay in 4 with Afterpay
              </p>
            </div>
          </div>

          <div className="relative order-1 min-h-[46vh] sm:min-h-[58vh] lg:order-2 lg:min-h-[38rem]">
            <Image
              src="/products/latte-blanket.jpg"
              alt="A camel crochet blanket with small heart motifs spread across a cream sofa in a sunlit room"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          Featured — deliberately the second thing on the page.
          ===================================================================== */}
      <section aria-labelledby="featured-heading" className="shell pt-20 sm:pt-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">On the hook now</p>
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
              <ProductCard key={product.id} product={product} index={index} priority={index === 0} />
            ))}
          </div>
        ) : (
          <p className="prose-editorial text-muted">
            The shop is being set up. Come back shortly, or{" "}
            <Link href="/commission" className="link">
              commission something
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
                often, a merino blend for the ones meant to be sat under. What you are paying for is
                the time, and the fact that it was spent on your piece specifically.
              </p>
            </div>
            <Link href="/atelier#process" className="btn btn-ghost mt-8">
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
            By what it's for
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
          Commission — the highest-margin thing Sydney sells, given a full
          band rather than a footer link.
          ===================================================================== */}
      <section aria-labelledby="commission-heading" className="on-dark mt-24 sm:mt-32">
        <div className="shell grid items-center gap-10 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">Made for you</p>
            <h2 id="commission-heading" className="display-lg">
              Something that doesn't exist yet
            </h2>
            <p className="prose-editorial mt-6 text-camel-light">
              A blanket in her colours for a wedding. A christening piece with a name worked into the
              corner. Tell Sydney what you have in mind and she will come back with a price, a
              timeline, and a yarn.
            </p>
            <Link href="/commission" className="btn btn-inverse mt-8">
              Start a commission
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
