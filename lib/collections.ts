/**
 * Editorial collections.
 *
 * A collection is a curated, seasonal grouping that sits on top of the shop
 * catalogue. It is deliberately NOT a Square category: categories are how the
 * shop is organised permanently, a collection is what the homepage is talking
 * about this season. Swapping autumn for the holiday collection in December is
 * a copy change in this file, nothing more.
 *
 * Each slide references a product by slug. The homepage looks the product up
 * at render time for its live price and availability, so a slide never shows
 * a number that disagrees with the product page. If the slug is not found in
 * the catalogue the slide still renders — just without a price.
 */

export interface CollectionSlide {
  /** Matches `Product.slug` in the catalogue. */
  slug: string;
  name: string;
  /** One line: what it is, in the voice of the shop. */
  line: string;
  image: { src: string; alt: string };
  /**
   * Where this slide's "Shop …" button goes, and what it says, when they
   * differ from the collection's. The coasters sit in a different category
   * from the blankets, so they need their own.
   */
  shopHref?: string;
  shopLabel?: string;
  /**
   * CSS `object-position` for the full-bleed crop. The photographs are
   * portrait and the hero is landscape, so each one needs to be told where the
   * blanket actually is.
   */
  focus: string;
}

export interface Collection {
  eyebrow: string;
  title: string;
  /** Where "Shop the collection" goes. */
  href: string;
  slides: CollectionSlide[];
}

export const FALL_COLLECTION: Collection = {
  eyebrow: "Fall 2026",
  title: "The Fall Collection",
  href: "/shop/category/blankets-and-throws",
  slides: [
    {
      slug: "autumn-blanket",
      name: "The Autumn Blanket",
      line: "Olive, cream and burnt rust in three wide bands. Chunky, heavy, and made exactly once.",
      image: {
        src: "/products/autumn-blanket.jpg",
        alt: "A chunky crochet blanket in wide bands of olive, cream and burnt rust, draped over someone reading on a cream sofa beside autumn leaves and candles",
      },
      focus: "50% 62%",
    },
    {
      slug: "latte-blanket",
      name: "The Latte Blanket",
      line: "Cream fading through camel to espresso, with small hearts worked into the ground.",
      image: {
        src: "/products/latte-blanket.jpg",
        alt: "A crochet blanket in bands of cream, camel and dark brown with small raised hearts, spread across a cream sofa",
      },
      focus: "50% 60%",
    },
    {
      slug: "olive-blanket",
      name: "The Olive Blanket",
      line: "One colour, a loose chunky stitch, and more drape than anything else in the shop.",
      image: {
        src: "/products/olive-blanket.jpg",
        alt: "A deep olive-green chunky crochet blanket draped over a cream armchair",
      },
      focus: "50% 62%",
    },
    {
      slug: "gameday-blanket",
      name: "The Gameday Blanket",
      line: "Deep burgundy with a cream football worked into the centre, laces and all.",
      image: {
        src: "/products/gameday-blanket.jpg",
        alt: "A deep burgundy crochet blanket with a large cream football worked into the centre, spread across a leather sofa",
      },
      focus: "50% 58%",
    },
    {
      slug: "team-blanket",
      name: "The Team Blanket",
      line: "Your team's colours at each end and the crest in the middle. Four photographed, any team made.",
      image: {
        src: "/products/team-blanket-dallas.jpg",
        alt: "A chunky navy crochet blanket with grey and cream stripes and a large star worked into the centre, over someone reading in an armchair",
      },
      focus: "50% 60%",
    },
    {
      slug: "the-bow-blanket",
      name: "The Bow Blanket",
      line: "A cream ground with cornflower-blue bows, each one made separately and stitched on by hand.",
      image: {
        src: "/products/bow-blanket-1.jpg",
        alt: "A thick cream crochet blanket with a wide blue band and hand-stitched blue bows, draped across a sofa",
      },
      focus: "50% 62%",
    },
    {
      slug: "rose-coasters",
      name: "Rose Coasters",
      line: "Four flat rounds edged in hand-worked roses. Dense enough for a cold glass, and they wash.",
      image: {
        src: "/products/rose-coasters.jpg",
        alt: "A set of cream crochet coasters edged with small red roses on a marble table, beside a matching red mug cosy and a lit candle",
      },
      shopHref: "/shop/category/for-the-home",
      shopLabel: "Shop for the home",
      focus: "50% 55%",
    },
  ],
};
