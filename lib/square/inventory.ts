import "server-only";

import { type SquareConfig, getSquareConfig, squareFetch } from "./client";

interface InventoryCount {
  catalog_object_id?: string;
  state?: string;
  location_id?: string;
  /** Square returns quantities as strings to avoid precision loss. */
  quantity?: string;
}

interface BatchRetrieveInventoryResponse {
  counts?: InventoryCount[];
  cursor?: string;
}

/** Square caps this endpoint's input at 1000 ids; we batch well below that. */
const BATCH_SIZE = 250;

/**
 * Returns on-hand counts keyed by catalog variation id.
 *
 * Inventory is read with `no-store`: a cached stock number is how a
 * one-of-a-kind piece gets sold twice, and for a maker with a single physical
 * copy of each item that is the worst failure the site can have. The catalogue
 * around it is still cached — only the number that decides whether a buyer can
 * check out is live.
 */
export async function getInventoryCounts(
  variationIds: string[],
  config?: SquareConfig,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const cfg = config ?? getSquareConfig();
  if (!cfg || variationIds.length === 0) return counts;

  const unique = Array.from(new Set(variationIds));

  try {
    for (let offset = 0; offset < unique.length; offset += BATCH_SIZE) {
      const batch = unique.slice(offset, offset + BATCH_SIZE);
      let cursor: string | undefined;

      do {
        const response = await squareFetch<BatchRetrieveInventoryResponse>(
          "/v2/inventory/counts/batch-retrieve",
          {
            method: "POST",
            body: {
              catalog_object_ids: batch,
              location_ids: [cfg.locationId],
              states: ["IN_STOCK"],
              ...(cursor ? { cursor } : {}),
            },
            cache: "no-store",
            retries: 2,
          },
          cfg,
        );

        for (const count of response.counts ?? []) {
          if (!count.catalog_object_id || count.state !== "IN_STOCK") continue;
          const quantity = Number.parseFloat(count.quantity ?? "0");
          if (!Number.isFinite(quantity)) continue;
          counts.set(
            count.catalog_object_id,
            (counts.get(count.catalog_object_id) ?? 0) + Math.floor(quantity),
          );
        }

        cursor = response.cursor;
      } while (cursor);
    }
  } catch (error) {
    // Falling through with an empty map means every tracked variation reads as
    // zero and shows as sold out. That is the safe direction to fail: a missed
    // sale costs less than selling a piece that does not exist.
    console.error("[square] inventory read failed:", error);
  }

  return counts;
}

/**
 * Re-checks stock for the exact lines about to be charged, immediately before
 * creating the order. The cart may have been sitting open for an hour.
 */
export async function assertStockAvailable(
  lines: Array<{ variationId: string; quantity: number; name: string }>,
  config?: SquareConfig,
): Promise<{ ok: true } | { ok: false; unavailable: Array<{ name: string; available: number }> }> {
  const cfg = config ?? getSquareConfig();
  if (!cfg) return { ok: true };

  const counts = await getInventoryCounts(
    lines.map((line) => line.variationId),
    cfg,
  );

  const unavailable: Array<{ name: string; available: number }> = [];
  for (const line of lines) {
    // A variation absent from the response is untracked, not out of stock.
    if (!counts.has(line.variationId)) continue;
    const available = counts.get(line.variationId) ?? 0;
    if (available < line.quantity) {
      unavailable.push({ name: line.name, available });
    }
  }

  return unavailable.length > 0 ? { ok: false, unavailable } : { ok: true };
}
