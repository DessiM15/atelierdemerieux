"use client";

import { useId, useState } from "react";
import type { ProductImage } from "@/lib/types";
import { ProductMedia } from "./product-media";

/**
 * Product imagery.
 *
 * A thumbnail list plus a main frame rather than a carousel: carousels hide
 * content behind a timer or a gesture, are notoriously hard to operate with a
 * keyboard, and on a page whose job is to show texture, every photograph
 * should be reachable in one action.
 *
 * Thumbnails are a tablist, so arrow keys move between them and the selected
 * image is announced without any custom live region.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();

  if (images.length === 0) {
    return (
      <div className="bg-parchment">
        <ProductMedia image={undefined} productName={productName} className="aspect-[4/5] w-full object-cover" />
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0]!;

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const lastIndex = images.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = activeIndex === lastIndex ? 0 : activeIndex + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = activeIndex === 0 ? lastIndex : activeIndex - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = lastIndex;
    }

    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden bg-parchment">
        <div
          id={`${baseId}-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${activeIndex}`}
          tabIndex={0}
        >
          <ProductMedia
            image={active}
            productName={productName}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>

      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label={`${productName} images`}
          className="flex gap-3 overflow-x-auto pb-1"
          onKeyDown={onKeyDown}
        >
          {images.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={image.id}
                id={`${baseId}-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                className={`
                  w-20 shrink-0 overflow-hidden border-2 bg-parchment transition-colors
                  ${selected ? "border-ink" : "border-transparent hover:border-camel"}
                `}
              >
                <span className="sr-only">
                  View image {index + 1} of {images.length}
                  {image.alt ? `: ${image.alt}` : ""}
                </span>
                <ProductMedia
                  image={image}
                  productName={productName}
                  decorative
                  sizes="80px"
                  className="aspect-[4/5] w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
