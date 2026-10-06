/**
 * Square has no concept of a URL slug, so the storefront derives one.
 *
 * Stability matters more than prettiness here: a slug that changes when Sydney
 * edits a product name breaks every link anyone has shared. So the slug is
 * name-derived for readability but collision-resolved with a short, stable
 * suffix taken from the Square object id — which never changes.
 */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip the combining marks NFKD just split off, so "Mérieux" becomes
    // "merieux" rather than losing the letter entirely.
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    // Drop apostrophes rather than turning them into hyphens: "sydney's" should
    // slug to "sydneys", not "sydney-s".
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

/** Last 6 characters of a Square id, lowercased. Stable for the object's life. */
export function idSuffix(id: string): string {
  return id.slice(-6).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Builds slugs for a whole catalogue at once so collisions can be detected.
 * Only the colliding entries get a suffix, which keeps the common case clean.
 */
export function buildSlugMap(items: Array<{ id: string; name: string }>): Map<string, string> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const base = slugify(item.name) || "piece";
    counts.set(base, (counts.get(base) ?? 0) + 1);
  }

  const slugs = new Map<string, string>();
  for (const item of items) {
    const base = slugify(item.name) || "piece";
    const isColliding = (counts.get(base) ?? 0) > 1;
    slugs.set(item.id, isColliding ? `${base}-${idSuffix(item.id)}` : base);
  }
  return slugs;
}
