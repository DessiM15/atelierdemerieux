# Atelier de Merieux

Storefront for Sydney's handmade crochet atelier. Next.js 16 (App Router) on Vercel, with Square as the single source of truth for products, inventory, orders and payments.

The whole purchase happens on this site — nobody is ever redirected to a Square-hosted page.

---

## Running it

```bash
npm install
cp .env.example .env.local   # fill in Square credentials
npm run dev
```

The site runs **without any credentials**. When `SQUARE_ACCESS_TOKEN` is absent it falls back to the seed catalogue in `lib/seed.ts`, so every page renders and can be reviewed. Add the credentials and it switches to the live shop with no code change. Checkout is the one thing that genuinely requires Square — it returns a clear 503 until then.

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

---

## Connecting Square

1. Create an application at <https://developer.squareup.com/apps>.
2. Copy the **sandbox** credentials into `.env.local`:

   | Variable | Where it comes from |
   | --- | --- |
   | `SQUARE_ACCESS_TOKEN` | Credentials → Sandbox access token. **Server only — never prefix with `NEXT_PUBLIC_`.** |
   | `NEXT_PUBLIC_SQUARE_APPLICATION_ID` | Credentials → Sandbox application ID |
   | `NEXT_PUBLIC_SQUARE_LOCATION_ID` | Locations → the location ID |
   | `SQUARE_LOCATION_ID` | Same value, read server-side |
   | `SQUARE_WEBHOOK_SIGNATURE_KEY` | Webhooks → signature key |
   | `SQUARE_ENVIRONMENT` | `sandbox` while building, `production` to take real money |

3. Subscribe a webhook to `https://<domain>/api/webhooks/square` for:
   - `catalog.version.updated`
   - `inventory.count.updated`

   The second matters most: if Sydney sells a one-of-a-kind piece at a market, this is what removes it from the website before somebody buys it again online.

4. Switch to production by swapping the four credential values and setting `SQUARE_ENVIRONMENT=production`. Nothing else changes.

### Craft metadata

Sydney authors everything in the Square dashboard — there is no second CMS to learn. Create these once under **Items → Custom attributes**, then fill them per item:

| Key | Type | Example |
| --- | --- | --- |
| `made_to_order` | boolean | `true` — nothing on the shelf; the order starts the work |
| `one_of_a_kind` | boolean | `true` — only one will ever exist |
| `lead_time_days` | string | `18-25` |
| `fiber` | string | `100% acrylic chenille, machine-washable` |
| `care` | string | `Machine wash cold on gentle, lay flat to dry` |
| `dimensions_in` | string | `Throw: 50x60` |

All optional. An item with none of them renders as a plain ready-to-ship piece, so a half-finished catalogue never breaks a page.

**Image alt text** comes from each image's *caption* field in Square. A build in development logs a warning naming every product whose images are missing one.

---

## How it is put together

```
app/
  page.tsx                      home — full-bleed collection hero, shop one tap away
  shop/                         grid, category, product detail
  custom-order/                 custom-order request flow (was /commission)
  meet-the-maker/               meet the maker + process (was /atelier)
  checkout/                     on-site payment + confirmation
  policies/[slug]/              shipping, returns, care, privacy, terms
  accessibility/                the conformance statement
  api/
    checkout/                   order + payment against Square
    custom-order/  waitlist/    leads → Square customer directory
    webhooks/square/            signature-verified cache busting
components/                     UI, one client island per interactive region
lib/
  collections.ts                seasonal hero collections (the Fall blankets)
  square/                       typed REST wrappers (client, catalog,
                                inventory, orders, customers)
  seed.ts                       stand-in catalogue used when Square is absent
  shipping.ts                   the one place shipping policy is defined
  policies.ts                   all legal copy, in one readable file
```

### Decisions worth knowing

**Square via REST, not the SDK.** The surface used here is small and the REST shapes are pinned by the `Square-Version` header. Owning the fetch means owning retries, idempotency and error shaping instead of inheriting an SDK's.

**Prices are never accepted from the browser.** Order line items reference `catalog_object_id`, so Square prices every order from its own catalogue. A tampered request cannot change what a buyer is charged.

**Inventory is read with `no-store`.** The catalogue around it is cached for five minutes and busted by webhook, but the number that decides whether someone can check out is always live. Stock is re-checked once more immediately before the charge. For a maker whose pieces are often one of one, selling the same blanket twice is the worst thing the site could do.

**Capture on order, not on ship.** Square authorisations expire after six days and lead times run to four weeks, so made-to-order work is charged up front. That is exactly why the lead time is disclosed on the product page, in the bag, and in the checkout summary — before payment, not in the confirmation email.

**Reveal animations never hide content.** `.reveal` only becomes invisible after JavaScript has mounted and confirmed `IntersectionObserver` exists. With JS off, a failed hydration, or a crawler, the page renders fully visible.

---

## Accessibility

Built to **WCAG 2.2 Level AA**. The public statement at `/accessibility` lists what was done and what is still imperfect — keep it true as the site changes.

Load-bearing details, so they are not undone by accident:

- `:focus-visible` is never removed, and inverts on dark sections.
- Links in body text are underlined — colour is never the only signal.
- The bag is a native `<dialog>`: platform focus trapping, Escape, return focus.
- Forms have persistent visible labels, `autocomplete`, `aria-invalid`, and an error summary at the top that is focused on failure and links to each field.
- Cart changes are announced through one polite live region at the root.
- Zoom is not capped. Targets are ≥44px.
- `prefers-reduced-motion` disables reveals entirely rather than speeding them up.

**Do not install an accessibility overlay widget.** They do not fix underlying problems, they interfere with assistive technology users have already configured, and their presence is associated with *more* litigation, not less.

---

## Still to do

- [ ] Replace the SAMPLE copy on `/meet-the-maker` (facts, story, FAQ, quote) and the sample reviews on the homepage with Sydney's real details

- [ ] Replace `CONTACT_EMAIL` and the business address in `lib/policies.ts`
- [ ] Confirm real shipping rates and update `lib/shipping.ts` (currently free over $150, $8 flat below)
- [ ] Decide whether local pickup is offered (`SHIPPING.localPickupEnabled`)
- [ ] Have the policies reviewed before taking real money
- [ ] Pick a logo direction and replace the placeholder marks in `components/wordmark.tsx`
- [ ] Add favicon and OG share image once the logo is chosen
- [ ] Reviews / customer photos (agreed in scope, not yet built)
- [ ] Gift cards via the Square Gift Cards API (gift *options* are built; cards are not)
- [ ] Third-party accessibility audit, then update `/accessibility` with the date
