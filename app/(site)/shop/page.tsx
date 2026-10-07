import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/square/catalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Three collections, worked by hand: blankets and throws, pieces for the home, and the little things.",
};

/**
 * The shop entrance: three full-bleed panels, one per collection. The full
 * grid lives at /shop/all for people who want everything at once.
 *
 * The panels are fixed, not read from the catalogue: this page has to look
 * finished even while Sydney's Square account is still empty. Each panel
 * links to its collection when that category exists in the catalogue, and
 * to the full grid until it does.
 */
const PANELS = [
  {
    slug: "blankets-and-throws",
    name: "Blankets & Throws",
    line: "Weeks of work in a single piece. Made to be used, not saved for guests.",
    src: "/products/autumn-blanket.jpg",
    alt: "A chunky crochet blanket in bands of olive, cream and rust draped over a cream sofa",
    focus: "50% 60%",
  },
  {
    slug: "for-the-home",
    name: "For the Home",
    line: "Small things that make a room feel finished.",
    src: "/products/rose-coasters.jpg",
    alt: "Cream crochet coasters edged with small red roses on a marble table",
    focus: "50% 55%",
  },
  {
    slug: "the-little-things",
    name: "The Little Things",
    line: "For the car, the hair, the gift that needed to be something.",
    src: "/products/tulip-mirror-hanger.jpg",
    alt: "A crochet hanger of pale pink tulips swinging from a car's rear-view mirror",
    focus: "50% 45%",
  },
] as const;

export default async function ShopPage() {
  const categories = await getCategories();
  const known = new Set(categories.map((category) => category.slug));

  return (
    <div>
      <h1 className="sr-only">Shop the collections</h1>

      <section
        aria-label="Collections"
        className="panels grid min-h-[calc(100svh-5.25rem)] grid-rows-3 lg:grid-cols-3 lg:grid-rows-1"
      >
        {PANELS.map((panel, index) => {
          return (
            <Link
              key={panel.slug}
              href={known.has(panel.slug) ? `/shop/category/${panel.slug}` : "/shop/all"}
              className="panel group relative isolate flex min-h-[18rem] items-end overflow-hidden text-cream lg:items-center lg:justify-center"
            >
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 34vw"
                className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.04]"
                style={{ objectPosition: panel.focus }}
              />
              {/* The plum tint, by request. Deep enough that cream type reads
                  on any photograph; it lifts a little on hover. */}
              <div className="panel-tint absolute inset-0 transition-opacity duration-700 group-hover:opacity-80" />

              <div className="relative flex w-full flex-col items-start gap-5 p-8 sm:p-10 lg:items-center lg:text-center">
                <p className="eyebrow !text-camel-light">
                  Collection {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="display-lg text-cream">{panel.name}</h2>
                <p className="prose-editorial max-w-[26ch] text-cream/85">{panel.line}</p>
                <span className="btn btn-inverse mt-2">Shop the collection</span>
              </div>
            </Link>
          );
        })}
      </section>

      <div className="shell -mb-24 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-10 text-center sm:-mb-32">
        <Link href="/shop/all" className="nav-link">
          Or see everything at once
        </Link>
      </div>
    </div>
  );
}
