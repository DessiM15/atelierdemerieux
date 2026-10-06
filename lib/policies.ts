import { SHIPPING } from "./shipping";
import { formatMoney } from "./money";

/**
 * Policy content.
 *
 * Written plainly and kept in one file so Sydney (or her lawyer) can read the
 * whole legal surface of the site in one sitting. These are a starting point
 * drafted to be fair and enforceable, not legal advice — they should be
 * reviewed before the shop takes real money, and the business address and
 * contact email have to be filled in.
 */

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  /** Rendered as a bulleted list under the paragraphs. */
  bullets?: string[];
}

export interface Policy {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: PolicySection[];
}

/** TODO: replace before launch. */
export const CONTACT_EMAIL = "hello@atelierdemerieux.com";
const UPDATED = "6 October 2026";

export const policies: Policy[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "shipping",
    title: "Shipping",
    summary: `Free over ${formatMoney(SHIPPING.freeThreshold)}. Ready-to-ship pieces leave within one business day; made-to-order pieces leave when they are finished.`,
    updated: UPDATED,
    sections: [
      {
        heading: "What it costs",
        paragraphs: [
          `Orders of ${formatMoney(SHIPPING.freeThreshold)} or more ship free within the United States. Below that, shipping is a flat ${formatMoney(SHIPPING.flatRate)} however many pieces are in the order.`,
          "We do not currently ship outside the United States. If you are abroad and want something, write to us and we will work out whether it is possible.",
        ],
      },
      {
        heading: "When it leaves",
        paragraphs: [
          "Pieces marked ready to ship are in the studio now. Orders placed before noon Central go out the same business day; anything later goes the next one.",
          "Pieces marked made to order are started when you order them. The product page states the lead time before you buy, and that window is the number we hold ourselves to. If something is going to take longer than quoted, you will hear from Sydney before the window closes — with the option of a full refund if the new date does not work for you.",
        ],
      },
      {
        heading: "How it travels",
        paragraphs: [
          `Everything goes ${SHIPPING.carrier}, typically ${SHIPPING.transitDays.min} to ${SHIPPING.transitDays.max} business days in transit, with tracking emailed the moment the label is made.`,
          "Once a parcel is with the carrier it is out of our hands. If tracking stops moving for more than five business days, tell us and we will open a case and sort it out with you.",
        ],
      },
      {
        heading: "Addresses",
        paragraphs: [
          "We ship to the address you give at checkout, exactly as entered. Check it before you pay — once a label is made it cannot be changed, and a parcel sent to a wrong address that is not returned to us cannot be replaced free of charge.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "returns",
    title: "Returns",
    summary:
      "Every piece is made once, by hand, so all sales are final. If something arrives damaged or is not what was described, that is a different matter and we will fix it.",
    updated: UPDATED,
    sections: [
      {
        heading: "All sales are final",
        paragraphs: [
          "Atelier de Merieux is one person making one piece at a time. A returned blanket is three weeks of work that cannot be recovered and, because each piece is made individually, cannot simply be put back on a shelf. For that reason we do not accept returns or exchanges for change of mind, for colour not being quite what you pictured, or for size.",
          "This is stated on every product page, in your bag, and at checkout, so that you meet it before you pay rather than afterwards.",
        ],
      },
      {
        heading: "What we will always put right",
        paragraphs: [
          "Final sale does not mean you have no protection, and nothing in this policy limits rights you have under law. Write to us within 14 days of delivery and we will repair, remake or refund — our choice of remedy, your choice of refund if we cannot put it right — in any of these cases:",
        ],
        bullets: [
          "The piece arrived damaged or soiled.",
          "The piece is materially different from its description, photographs or stated dimensions.",
          "The piece has a making fault — a dropped stitch that runs, a seam that opens, a fastening that fails in normal use.",
          "The wrong item arrived.",
        ],
      },
      {
        heading: "How to tell us",
        paragraphs: [
          `Email ${CONTACT_EMAIL} with your order number and photographs of the problem. Photographs matter: they are usually enough for Sydney to tell what happened and respond the same day, and they save you posting anything back.`,
          "If we ask for the piece back, we pay the postage.",
        ],
      },
      {
        heading: "Custom orders",
        paragraphs: [
          "Custom-order work is final from the moment it is started, because it is made to a specification only you asked for. Sydney will confirm colour, size and any lettering in writing before beginning, and that confirmation is what the finished piece is measured against.",
        ],
      },
      {
        heading: "Care is not a fault",
        paragraphs: [
          "Each piece ships with its fibre content and washing instructions, and both are on the product page before you buy. Damage caused by washing against those instructions — shrinkage from a hot wash, felting from a tumble dryer, a snagged stitch pulled through — is not something we can replace. If you are unsure how to wash something, ask first and we will tell you.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "care",
    title: "Care & fibre",
    summary:
      "Most pieces are machine-washable chenille; the cotton ones are not. Each product page states which is which.",
    updated: UPDATED,
    sections: [
      {
        heading: "Read the piece, not the page",
        paragraphs: [
          "Fibre and care are listed on every product page and printed on the tag that ships with the piece. They differ: the chenille blankets are built to go in a machine, the cotton small goods mostly are not. When the two disagree, the tag is right.",
        ],
      },
      {
        heading: "Blankets and throws",
        paragraphs: [
          "Machine wash cold on a gentle cycle, inside a mesh laundry bag if you have one — the bag is what stops a corner catching on the drum. Tumble dry low or, better, lay flat. No bleach, no fabric softener; softener coats the fibre and flattens the loft that makes a chunky stitch look the way it does.",
        ],
      },
      {
        heading: "Cotton small goods",
        paragraphs: [
          "Coasters and scrunchies can go in a machine in a mesh bag on cold, then lay flat. Mirror hangers and anything with a wire or wooden element are spot clean only.",
        ],
      },
      {
        heading: "Pilling, stretching and other normal things",
        paragraphs: [
          "A new blanket sheds a little in its first wash. That stops. Chunky crochet also relaxes with use and grows slightly — a piece that measures an inch over its stated size after a month is behaving correctly, not faulty.",
          "If a stitch pulls loose, do not cut it. Ease it back through with a blunt needle, or send Sydney a photograph and she will talk you through it. Crochet unravels in one direction only, and a pulled loop is almost always fixable.",
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "privacy",
    title: "Privacy",
    summary:
      "We collect what is needed to take an order and send it to you. Payments are handled by Square; we never see or store your card.",
    updated: UPDATED,
    sections: [
      {
        heading: "What we collect",
        paragraphs: [
          "When you buy something: your name, email address, shipping address, and a phone number if you give one. When you join the list or ask to be told about a piece: your email address. When you request a custom order: what you told us in the form.",
        ],
      },
      {
        heading: "Your card",
        paragraphs: [
          "Card details are entered into fields hosted by Square, Inc. and go straight to Square. They do not pass through this website and are never stored on our servers. We receive only a confirmation that a payment succeeded, the last four digits, and the card brand.",
          "Square processes payments as an independent controller of that data under its own privacy policy.",
        ],
      },
      {
        heading: "Where it lives",
        paragraphs: [
          "Order and customer records are held in Square, which is the system Sydney runs the business from. We do not sell or rent your information to anyone, and we do not share it beyond what is needed to take payment and post your order.",
        ],
      },
      {
        heading: "Email",
        paragraphs: [
          "We email you about your order because you bought something. We email you about new pieces only if you asked us to, and every one of those has an unsubscribe link that works immediately.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "This site sets no advertising or tracking cookies. Your bag is kept in your own browser's local storage so it survives a refresh; it never reaches our servers until you check out, and clearing your browser data clears it.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          `Write to ${CONTACT_EMAIL} to see what we hold about you, correct it, or have it deleted. We will respond within 30 days. Deleting your data does not delete completed order records where we are required to keep them for tax purposes.`,
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "terms",
    title: "Terms",
    summary: "The plain version: we make it, you pay for it, we send it.",
    updated: UPDATED,
    sections: [
      {
        heading: "Who you are buying from",
        paragraphs: [
          "Atelier de Merieux, a sole proprietorship operating in the United States. Contact: " +
            CONTACT_EMAIL +
            ". [Business address to be added before launch.]",
        ],
      },
      {
        heading: "Orders",
        paragraphs: [
          "An order is accepted when we send your confirmation email, not when you submit the form. If we cannot fulfil an order — a piece sold in person moments earlier, a yarn discontinued mid-run — we will tell you and refund you in full.",
          "Prices are in US dollars and include no sales tax until it is calculated at checkout.",
        ],
      },
      {
        heading: "Handmade means variation",
        paragraphs: [
          "Every piece is worked by hand, so no two are identical and none will match its photograph exactly. Stitch counts, dimensions and dye lots vary slightly. Stated dimensions are accurate to within about an inch; colours vary between screens and we cannot guarantee what yours shows.",
          "This variation is the product, not a defect.",
        ],
      },
      {
        heading: "Custom orders",
        paragraphs: [
          "A custom order begins when Sydney confirms the specification in writing and you pay the invoice. Changes after that point may change the price or the date, and both will be agreed with you before any further work. Custom-order work is final sale.",
        ],
      },
      {
        heading: "Photographs and words",
        paragraphs: [
          "Everything on this site — the photographs, the writing, the designs and the stitch patterns — belongs to Atelier de Merieux. You are welcome to share photographs of a piece you own. Please do not use our images to sell anything.",
        ],
      },
      {
        heading: "Limits",
        paragraphs: [
          "Our liability for any order is limited to what you paid for it. Nothing here excludes liability for anything that cannot lawfully be excluded, including rights you have as a consumer under state or federal law.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}
