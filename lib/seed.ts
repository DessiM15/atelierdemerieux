import type { Category, Product, ProductImage } from "./types";

/**
 * Stand-in catalogue.
 *
 * Built from Sydney's own photography, so the storefront can be reviewed and
 * demonstrated before her Square shop is connected. Prices, lead times and
 * copy are placeholders written in the brand voice — they show what a finished
 * product entry looks like, and they are the shape her real Square items
 * should be filled out to match.
 *
 * Nothing in this file is imported once `SQUARE_ACCESS_TOKEN` is set.
 */

/**
 * Alt text is written per image, by hand, describing the piece rather than the
 * room. Someone who cannot see the photograph is here to buy a blanket, not to
 * hear about the candle on the side table — so the colour, the stitch and the
 * scale come first, and the setting only where it conveys size.
 */
function image(file: string, alt: string): ProductImage {
  return { id: file, url: `/products/${file}.jpg`, alt, width: 1122, height: 1402 };
}

export const seedCategories: Category[] = [
  {
    id: "cat-blankets",
    slug: "blankets-and-throws",
    name: "Blankets & Throws",
    blurb: "Weeks of work in a single piece. Made to be used, not saved for guests.",
  },
  {
    id: "cat-home",
    slug: "for-the-home",
    name: "For the Home",
    blurb: "Small things that make a room feel finished.",
  },
  {
    id: "cat-small",
    slug: "small-things",
    name: "Small Things",
    blurb: "For the car, the hair, the gift that needed to be something.",
  },
];

export const seedProducts: Product[] = [
  /* ------------------------------------------------------------------ *
     Blankets
   * ------------------------------------------------------------------ */
  {
    id: "seed-bow",
    slug: "the-bow-blanket",
    name: "The Bow Blanket",
    description:
      "A heavy cream ground with hand-worked bows set across it in cornflower blue. Each bow is made separately and stitched on by hand, which is most of where the three weeks go. The one people photograph.",
    categoryIds: ["cat-blankets"],
    images: [
      image(
        "bow-blanket-1",
        "A thick cream crochet blanket covered in cornflower-blue bows, draped across a bed",
      ),
      image(
        "bow-blanket-2",
        "The same cream and blue bow blanket folded over the end of a made bed, showing the chunky stitch and the raised bows",
      ),
    ],
    variations: [
      {
        id: "seed-bow-v1",
        name: "Throw · 50 × 60 in",
        price: { amount: 26500, currency: "USD" },
        tracksInventory: false,
        quantity: null,
      },
      {
        id: "seed-bow-v2",
        name: "Oversized · 60 × 80 in",
        price: { amount: 34500, currency: "USD" },
        tracksInventory: false,
        quantity: null,
      },
    ],
    madeToOrder: true,
    leadTime: { minDays: 18, maxDays: 25 },
    fiber: "100% acrylic chenille, machine-washable",
    care: "Machine wash cold on gentle in a mesh bag. Tumble dry low or lay flat.",
    dimensions: { label: "Throw", widthIn: 50, lengthIn: 60 },
    oneOfAKind: false,
  },
  {
    id: "seed-latte",
    slug: "latte-blanket",
    name: "The Latte Blanket",
    description:
      "Cream fading through camel to espresso in wide bands, with small hearts set into the ground rather than sewn on top. Reads as texture from across a room and as detail up close. The one to put on a sofa you do not want to change.",
    categoryIds: ["cat-blankets"],
    images: [
      image(
        "latte-blanket",
        "A crochet blanket in bands of cream, camel and dark brown with small raised heart motifs, spread over a cream sofa",
      ),
    ],
    variations: [
      {
        id: "seed-latte-v1",
        name: "Throw · 50 × 60 in",
        price: { amount: 24500, currency: "USD" },
        tracksInventory: false,
        quantity: null,
      },
    ],
    madeToOrder: true,
    leadTime: { minDays: 14, maxDays: 21 },
    fiber: "100% acrylic chenille, machine-washable",
    care: "Machine wash cold on gentle in a mesh bag. Tumble dry low or lay flat.",
    dimensions: { label: "Throw", widthIn: 50, lengthIn: 60 },
    oneOfAKind: false,
  },
  {
    id: "seed-autumn",
    slug: "autumn-blanket",
    name: "The Autumn Blanket",
    description:
      "Olive, cream and burnt rust in three wide bands, worked in a chunky stitch that holds its shape. Heavy enough to stay where you put it. Made once in this colourway.",
    categoryIds: ["cat-blankets"],
    images: [
      image(
        "autumn-blanket",
        "A chunky crochet blanket in wide bands of olive, cream and burnt rust, draped across a cream sofa",
      ),
    ],
    variations: [
      {
        id: "seed-autumn-v1",
        name: "Throw · 50 × 60 in",
        price: { amount: 22500, currency: "USD" },
        tracksInventory: true,
        quantity: 1,
      },
    ],
    madeToOrder: false,
    fiber: "100% acrylic chenille, machine-washable",
    care: "Machine wash cold on gentle in a mesh bag. Tumble dry low or lay flat.",
    dimensions: { label: "Throw", widthIn: 50, lengthIn: 60 },
    oneOfAKind: true,
  },
  {
    id: "seed-olive",
    slug: "olive-blanket",
    name: "The Olive Blanket",
    description:
      "Deep olive, worked in a loose chunky stitch so it drapes rather than sits. The quietest thing in the shop and the one that goes with everything.",
    categoryIds: ["cat-blankets"],
    images: [
      image(
        "olive-blanket",
        "A deep olive-green chunky crochet blanket draped over the arm of a cream sofa",
      ),
    ],
    variations: [
      {
        id: "seed-olive-v1",
        name: "Throw · 50 × 60 in",
        price: { amount: 22500, currency: "USD" },
        tracksInventory: true,
        quantity: 2,
      },
    ],
    madeToOrder: false,
    fiber: "100% acrylic chenille, machine-washable",
    care: "Machine wash cold on gentle in a mesh bag. Tumble dry low or lay flat.",
    dimensions: { label: "Throw", widthIn: 50, lengthIn: 60 },
    oneOfAKind: false,
  },
  {
    id: "seed-gameday",
    slug: "gameday-blanket",
    name: "The Gameday Blanket",
    description:
      "Deep burgundy with a football worked into the centre in cream, laces and all. Made for the chair nobody else is allowed to sit in. Best ordered well before the season.",
    categoryIds: ["cat-blankets"],
    images: [
      image(
        "gameday-blanket",
        "A deep burgundy crochet blanket with a cream football worked into the centre, spread across a sofa",
      ),
    ],
    variations: [
      {
        id: "seed-gameday-v1",
        name: "Throw · 50 × 60 in",
        price: { amount: 27500, currency: "USD" },
        tracksInventory: false,
        quantity: null,
      },
    ],
    madeToOrder: true,
    leadTime: { minDays: 21, maxDays: 28 },
    fiber: "100% acrylic chenille, machine-washable",
    care: "Machine wash cold on gentle in a mesh bag. Tumble dry low or lay flat.",
    dimensions: { label: "Throw", widthIn: 50, lengthIn: 60 },
    oneOfAKind: false,
  },

  /* ------------------------------------------------------------------ *
     For the home
   * ------------------------------------------------------------------ */
  {
    id: "seed-rose-coasters",
    slug: "rose-coasters",
    name: "Rose Coasters",
    description:
      "Set of four, each worked as a flat round with a rose at the centre, dense enough to take a cold glass without going soft. They wash and come back.",
    categoryIds: ["cat-home", "cat-small"],
    images: [
      image(
        "rose-coasters",
        "A set of cream crochet coasters edged with small red roses, arranged on a marble table beside a matching mug cosy",
      ),
    ],
    variations: [
      {
        id: "seed-rose-coasters-v1",
        name: "Set of 4 · Cream & red",
        price: { amount: 3800, currency: "USD" },
        tracksInventory: true,
        quantity: 4,
      },
      {
        id: "seed-rose-coasters-v2",
        name: "Set of 4 · Cream & plum",
        price: { amount: 3800, currency: "USD" },
        tracksInventory: true,
        quantity: 1,
      },
    ],
    madeToOrder: false,
    fiber: "100% cotton",
    care: "Machine wash cold in a mesh bag, lay flat to dry.",
    oneOfAKind: false,
  },

  /* ------------------------------------------------------------------ *
     Small things
   * ------------------------------------------------------------------ */
  {
    id: "seed-tulip-hanger",
    slug: "tulip-mirror-hanger",
    name: "Tulip Mirror Hanger",
    description:
      "Three soft pink tulips on a worked green stem, sized to swing from a rear-view mirror without touching the glass. The small thing that makes a car feel looked after.",
    categoryIds: ["cat-small"],
    images: [
      image(
        "tulip-mirror-hanger",
        "A crochet hanger of three pale pink tulips on green stems, hanging from a car's rear-view mirror",
      ),
    ],
    variations: [
      {
        id: "seed-tulip-hanger-v1",
        name: "Pink",
        price: { amount: 2600, currency: "USD" },
        tracksInventory: true,
        quantity: 6,
      },
    ],
    madeToOrder: false,
    fiber: "100% cotton",
    care: "Spot clean only.",
    oneOfAKind: false,
  },
  {
    id: "seed-bluebell-hanger",
    slug: "bluebell-mirror-hanger",
    name: "Bluebell Mirror Hanger",
    description:
      "Blue and buttercup flowers worked together on one stem. Made to hang from a mirror, but it has ended up on more than one bag strap.",
    categoryIds: ["cat-small"],
    images: [
      image(
        "bluebell-mirror-hanger",
        "A crochet hanger of blue and yellow flowers on a green stem, hooked over the corner of a round mirror",
      ),
    ],
    variations: [
      {
        id: "seed-bluebell-hanger-v1",
        name: "Blue & buttercup",
        price: { amount: 2600, currency: "USD" },
        tracksInventory: true,
        quantity: 2,
      },
    ],
    madeToOrder: false,
    fiber: "100% cotton",
    care: "Spot clean only.",
    oneOfAKind: false,
  },
  {
    id: "seed-scrunchies",
    slug: "ruffled-scrunchies",
    name: "Ruffled Scrunchies",
    description:
      "Worked over a soft elastic with a full ruffle, so they hold thick hair without leaving a crease. Sold singly or as a pair in the house colours.",
    categoryIds: ["cat-small"],
    images: [
      image(
        "scrunchies",
        "Ruffled crochet scrunchies in deep burgundy and cream, piled in a wooden bowl",
      ),
    ],
    variations: [
      {
        id: "seed-scrunchies-v1",
        name: "Single",
        price: { amount: 1400, currency: "USD" },
        tracksInventory: true,
        quantity: 11,
      },
      {
        id: "seed-scrunchies-v2",
        name: "Pair · burgundy & cream",
        price: { amount: 2400, currency: "USD" },
        tracksInventory: true,
        quantity: 5,
      },
    ],
    madeToOrder: false,
    fiber: "100% cotton over covered elastic",
    care: "Hand wash cold, air dry.",
    oneOfAKind: false,
  },
];
