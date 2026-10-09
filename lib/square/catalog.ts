import "server-only";

import type {
  Availability,
  Category,
  Dimensions,
  LeadTime,
  Product,
  ProductImage,
  ProductVariation,
} from "../types";
import { buildSlugMap } from "../slug";
import { seedCategories, seedProducts } from "../seed";
import { getSquareConfig, squareFetch } from "./client";
import { getInventoryCounts } from "./inventory";

/* ===========================================================================
   Raw Square shapes — only the fields we actually read.
   =========================================================================== */

interface SquareMoney {
  amount?: number;
  currency?: string;
}

interface CustomAttributeValue {
  key?: string;
  name?: string;
  type?: string;
  string_value?: string;
  boolean_value?: boolean;
  number_value?: string;
  selection_uid_values?: string[];
}

interface CatalogObject {
  type: string;
  id: string;
  is_deleted?: boolean;
  custom_attribute_values?: Record<string, CustomAttributeValue>;
  item_data?: {
    name?: string;
    description?: string;
    description_plaintext?: string;
    categories?: Array<{ id?: string }>;
    category_id?: string;
    image_ids?: string[];
    ecom_available?: boolean;
    ecom_visibility?: string;
    variations?: CatalogObject[];
  };
  item_variation_data?: {
    item_id?: string;
    name?: string;
    sku?: string;
    pricing_type?: string;
    price_money?: SquareMoney;
    track_inventory?: boolean;
  };
  image_data?: { name?: string; url?: string; caption?: string };
  category_data?: { name?: string };
}

interface SearchCatalogResponse {
  objects?: CatalogObject[];
  related_objects?: CatalogObject[];
  cursor?: string;
}

/* ===========================================================================
   Custom attributes
   ---------------------------------------------------------------------------
   Sydney authors the craft metadata in Square itself, so there is no second
   dashboard to learn. Create these once under
   Square Dashboard → Items → Custom attributes, then fill them per item.

     made_to_order    boolean   nothing on the shelf; the order starts the work
     one_of_a_kind    boolean   only one will ever exist
     lead_time_days   string    "10-14" or a single number
     fiber            string    "100% Peruvian pima cotton"
     care             string    "Hand wash cold, lay flat to dry"
     dimensions_in    string    "Throw: 50x60"

   Everything is optional. A product with none of them renders as a plain
   ready-to-ship piece, so an unfinished catalogue never breaks a page.
   =========================================================================== */

const ATTR = {
  madeToOrder: "made_to_order",
  oneOfAKind: "one_of_a_kind",
  leadTime: "lead_time_days",
  fiber: "fiber",
  care: "care",
  dimensions: "dimensions_in",
} as const;

/**
 * Square namespaces custom attribute keys as `<application_id>:<key>`, so the
 * map key can't be matched directly. Each value carries its own bare `key`.
 */
function readAttribute(
  object: CatalogObject,
  key: string,
): CustomAttributeValue | undefined {
  const values = object.custom_attribute_values;
  if (!values) return undefined;
  for (const value of Object.values(values)) {
    if (value?.key === key) return value;
  }
  // Fall back to a suffix match in case the namespace prefix is absent.
  for (const [mapKey, value] of Object.entries(values)) {
    if (mapKey === key || mapKey.endsWith(`:${key}`)) return value;
  }
  return undefined;
}

function readBoolean(object: CatalogObject, key: string): boolean {
  const attribute = readAttribute(object, key);
  if (!attribute) return false;
  if (typeof attribute.boolean_value === "boolean") return attribute.boolean_value;
  return attribute.string_value?.toLowerCase() === "true";
}

function readString(object: CatalogObject, key: string): string | undefined {
  const value = readAttribute(object, key)?.string_value?.trim();
  return value ? value : undefined;
}

/** Parses "10-14", "10 - 14", or "14" into a lead time range. */
export function parseLeadTime(raw: string | undefined): LeadTime | undefined {
  if (!raw) return undefined;
  const numbers = raw.match(/\d+/g);
  if (!numbers || numbers.length === 0) return undefined;
  const min = Number(numbers[0]);
  const max = numbers[1] !== undefined ? Number(numbers[1]) : min;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  return { minDays: Math.min(min, max), maxDays: Math.max(min, max) };
}

/** Parses "Throw: 50x60" or "50 x 60" into dimensions. */
export function parseDimensions(raw: string | undefined): Dimensions | undefined {
  if (!raw) return undefined;
  const [labelPart, sizePart] = raw.includes(":") ? raw.split(":") : [undefined, raw];
  const numbers = (sizePart ?? "").match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length < 2) return undefined;
  return {
    label: labelPart?.trim() || "Finished size",
    widthIn: Number(numbers[0]),
    lengthIn: Number(numbers[1]),
  };
}

/* ===========================================================================
   Normalisation
   =========================================================================== */

function toProductImage(object: CatalogObject): ProductImage | null {
  const url = object.image_data?.url;
  if (!url) return null;
  return {
    id: object.id,
    url,
    // Square's "caption" field is its alt text. Items without one are flagged
    // below rather than silently given a useless alt.
    alt: object.image_data?.caption?.trim() ?? "",
  };
}

function toVariation(
  object: CatalogObject,
  counts: Map<string, number>,
): ProductVariation | null {
  const data = object.item_variation_data;
  if (!data) return null;

  const tracksInventory = data.track_inventory ?? false;

  return {
    id: object.id,
    name: data.name?.trim() || "Standard",
    ...(data.sku ? { sku: data.sku } : {}),
    price: {
      amount: data.price_money?.amount ?? 0,
      currency: data.price_money?.currency ?? "USD",
    },
    tracksInventory,
    quantity: tracksInventory ? (counts.get(object.id) ?? 0) : null,
  };
}

function toProduct(
  object: CatalogObject,
  slug: string,
  imagesById: Map<string, ProductImage>,
  counts: Map<string, number>,
): Product | null {
  const data = object.item_data;
  if (!data?.name) return null;

  const variations = (data.variations ?? [])
    .map((variation) => toVariation(variation, counts))
    .filter((variation): variation is ProductVariation => variation !== null);

  if (variations.length === 0) return null;

  const images = (data.image_ids ?? [])
    .map((id) => imagesById.get(id))
    .filter((image): image is ProductImage => image !== undefined);

  const categoryIds = [
    ...(data.categories ?? []).map((category) => category.id),
    data.category_id,
  ].filter((id): id is string => typeof id === "string");

  const madeToOrder = readBoolean(object, ATTR.madeToOrder);
  const leadTime = parseLeadTime(readString(object, ATTR.leadTime));
  const dimensions = parseDimensions(readString(object, ATTR.dimensions));
  const fiber = readString(object, ATTR.fiber);
  const care = readString(object, ATTR.care);

  return {
    id: object.id,
    slug,
    name: data.name.trim(),
    description: (data.description_plaintext ?? data.description ?? "").trim(),
    categoryIds: Array.from(new Set(categoryIds)),
    images,
    variations,
    madeToOrder,
    ...(leadTime ? { leadTime } : {}),
    ...(fiber ? { fiber } : {}),
    ...(care ? { care } : {}),
    ...(dimensions ? { dimensions } : {}),
    oneOfAKind: readBoolean(object, ATTR.oneOfAKind),
  };
}

/* ===========================================================================
   Public API
   ---------------------------------------------------------------------------
   Every function here falls back to the seed catalogue when Square is not
   configured, so the site builds, renders and is reviewable before a single
   credential exists. The moment the env vars land it switches over with no
   code change.
   =========================================================================== */

/** How long a catalogue read is cached. Webhooks bust this early on a change. */
const CATALOG_REVALIDATE_SECONDS = 300;
export const CATALOG_TAG = "square-catalog";

export async function getProducts(): Promise<Product[]> {
  const config = getSquareConfig();
  if (!config) return seedProducts;

  try {
    const objects: CatalogObject[] = [];
    const related: CatalogObject[] = [];
    let cursor: string | undefined;

    // Square pages at 100 objects. A handmade catalogue will not approach
    // this, but an unbounded loop here would be a latent outage.
    for (let page = 0; page < 20; page++) {
      const response = await squareFetch<SearchCatalogResponse>(
        "/v2/catalog/search",
        {
          method: "POST",
          body: {
            object_types: ["ITEM"],
            include_related_objects: true,
            include_deleted_objects: false,
            limit: 100,
            ...(cursor ? { cursor } : {}),
          },
          next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
          retries: 2,
        },
        config,
      );

      objects.push(...(response.objects ?? []));
      related.push(...(response.related_objects ?? []));
      cursor = response.cursor;
      if (!cursor) break;
    }

    const items = objects.filter(
      (object) =>
        object.type === "ITEM" &&
        !object.is_deleted &&
        // Respect Square's own "hide from online store" toggle so Sydney can
        // stage a piece before it goes live.
        object.item_data?.ecom_visibility !== "UNINDEXED_HIDDEN",
    );

    const imagesById = new Map<string, ProductImage>();
    for (const object of related) {
      if (object.type !== "IMAGE") continue;
      const image = toProductImage(object);
      if (image) imagesById.set(object.id, image);
    }

    // One inventory call for every variation, rather than one per product.
    const variationIds = items.flatMap((item) =>
      (item.item_data?.variations ?? []).map((variation) => variation.id),
    );
    const counts = await getInventoryCounts(variationIds, config);

    const slugs = buildSlugMap(
      items.map((item) => ({ id: item.id, name: item.item_data?.name ?? "" })),
    );

    const products = items
      .map((item) => toProduct(item, slugs.get(item.id) ?? item.id, imagesById, counts))
      .filter((product): product is Product => product !== null);

    if (process.env.NODE_ENV !== "production") warnAboutMissingAltText(products);

    return products;
  } catch (error) {
    // A catalogue read failing should degrade to an empty shop with a notice,
    // never a 500 across the whole site.
    console.error("[square] catalog read failed:", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const category = categories.find((entry) => entry.slug === categorySlug);
  if (!category) return [];
  return products.filter((product) => product.categoryIds.includes(category.id));
}

export async function getCategories(): Promise<Category[]> {
  const config = getSquareConfig();
  if (!config) return seedCategories;

  try {
    const response = await squareFetch<SearchCatalogResponse>(
      "/v2/catalog/search",
      {
        method: "POST",
        body: {
          object_types: ["CATEGORY"],
          include_deleted_objects: false,
          limit: 100,
        },
        next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
        retries: 2,
      },
      config,
    );

    const raw = (response.objects ?? []).filter(
      (object) => object.type === "CATEGORY" && !object.is_deleted && object.category_data?.name,
    );

    const slugs = buildSlugMap(
      raw.map((object) => ({ id: object.id, name: object.category_data?.name ?? "" })),
    );

    return raw.map((object) => ({
      id: object.id,
      slug: slugs.get(object.id) ?? object.id,
      name: object.category_data!.name!.trim(),
    }));
  } catch (error) {
    console.error("[square] category read failed:", error);
    return [];
  }
}

/* ===========================================================================
   Derived helpers — used by components, kept here so the rules live in one
   place and the UI never re-derives availability on its own.
   =========================================================================== */

export function lowestPrice(product: Product) {
  return product.variations.reduce(
    (lowest, variation) => (variation.price.amount < lowest.amount ? variation.price : lowest),
    product.variations[0]!.price,
  );
}

export function totalStock(product: Product): number | null {
  // A single untracked variation means the product is effectively unlimited.
  if (product.variations.some((variation) => variation.quantity === null)) return null;
  return product.variations.reduce((total, variation) => total + (variation.quantity ?? 0), 0);
}

export function availabilityOf(product: Product): Availability {
  if (product.madeToOrder) return "made-to-order";
  const stock = totalStock(product);
  if (stock === null) return "ready-to-ship";
  return stock > 0 ? "ready-to-ship" : "sold-out";
}

export function variationAvailability(
  product: Product,
  variation: ProductVariation,
): Availability {
  if (product.madeToOrder) return "made-to-order";
  if (variation.quantity === null) return "ready-to-ship";
  return variation.quantity > 0 ? "ready-to-ship" : "sold-out";
}

/**
 * The scarcity line. Returns null when there is nothing worth saying — an
 * urgency message on a product with forty in stock trains people to ignore it.
 */
export function scarcityNote(product: Product): string | null {
  if (product.madeToOrder) return null;
  const stock = totalStock(product);
  if (stock === null || stock <= 0) return null;
  if (product.oneOfAKind && stock === 1) return "One of a kind";
  if (stock === 1) return "Last one";
  if (stock <= 3) return `Only ${stock} left`;
  return null;
}

/* ===========================================================================
   Development guard-rails
   =========================================================================== */

function warnAboutMissingAltText(products: Product[]): void {
  const offenders = products.filter((product) =>
    product.images.some((image) => image.alt.trim().length === 0),
  );
  if (offenders.length === 0) return;
  console.warn(
    `[a11y] ${offenders.length} product(s) have images with no alt text. ` +
      `Add a caption to each image in Square — it becomes the alt attribute. ` +
      `Missing: ${offenders.map((product) => product.name).join(", ")}`,
  );
}
