"use client";

import { useId, useState } from "react";
import type { Dimensions } from "@/lib/types";

/**
 * Scale against something real.
 *
 * "60 × 80 inches" means nothing to most people, and size uncertainty is one
 * of the biggest sources of hesitation — and of returns — in soft goods. On a
 * site where all sales are final, removing that uncertainty before purchase
 * isn't a nicety, it's the thing that keeps buyers from feeling misled.
 *
 * The drawing is marked `aria-hidden`; the same comparison is written out in
 * prose below it, so the information is never only available visually.
 */

interface Reference {
  key: string;
  label: string;
  widthIn: number;
  lengthIn: number;
  /** How to describe the piece sitting on it. */
  surface: string;
}

const REFERENCES: Reference[] = [
  { key: "sofa", label: "3-seat sofa", widthIn: 84, lengthIn: 36, surface: "across the back" },
  { key: "twin", label: "Twin bed", widthIn: 38, lengthIn: 75, surface: "on top" },
  { key: "queen", label: "Queen bed", widthIn: 60, lengthIn: 80, surface: "on top" },
  { key: "king", label: "King bed", widthIn: 76, lengthIn: 80, surface: "on top" },
];

export function ScaleVisualizer({ dimensions }: { dimensions: Dimensions }) {
  const [activeKey, setActiveKey] = useState(REFERENCES[2]!.key);
  const headingId = useId();
  const active = REFERENCES.find((reference) => reference.key === activeKey) ?? REFERENCES[2]!;

  // Scale both rectangles against whichever is largest so nothing overflows.
  const maxWidth = Math.max(active.widthIn, dimensions.widthIn);
  const maxLength = Math.max(active.lengthIn, dimensions.lengthIn);
  const viewWidth = 300;
  const viewHeight = 300;
  const padding = 28;
  const scale = Math.min(
    (viewWidth - padding * 2) / maxWidth,
    (viewHeight - padding * 2) / maxLength,
  );

  const refW = active.widthIn * scale;
  const refH = active.lengthIn * scale;
  const pieceW = dimensions.widthIn * scale;
  const pieceH = dimensions.lengthIn * scale;

  const cx = viewWidth / 2;
  const cy = viewHeight / 2;

  return (
    <section aria-labelledby={headingId} className="border border-rule p-5 sm:p-6">
      <h3 id={headingId} className="eyebrow mb-4">
        How big is it, really
      </h3>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full max-w-[16rem] shrink-0 self-center"
          aria-hidden="true"
          focusable="false"
        >
          {/* reference object */}
          <rect
            x={cx - refW / 2}
            y={cy - refH / 2}
            width={refW}
            height={refH}
            fill="none"
            stroke="var(--color-camel)"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {/* the piece */}
          <rect
            x={cx - pieceW / 2}
            y={cy - pieceH / 2}
            width={pieceW}
            height={pieceH}
            fill="var(--color-rubine)"
            opacity="0.82"
          />
          {/* reference label */}
          <text
            x={cx}
            y={cy - refH / 2 - 9}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-jost)"
            fill="var(--color-clay)"
          >
            {active.label} · {active.widthIn}&quot; × {active.lengthIn}&quot;
          </text>
          {/* piece label */}
          <text
            x={cx}
            y={cy + 4}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-jost)"
            fill="var(--color-cream)"
          >
            {dimensions.widthIn}&quot; × {dimensions.lengthIn}&quot;
          </text>
        </svg>

        <div className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Compare against" className="flex flex-wrap gap-2">
            {REFERENCES.map((reference) => {
              const selected = reference.key === activeKey;
              return (
                <label
                  key={reference.key}
                  className={`
                    cursor-pointer border px-3 py-2 text-[0.8125rem] transition-colors
                    ${selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"}
                  `}
                >
                  <input
                    type="radio"
                    name="scale-reference"
                    value={reference.key}
                    checked={selected}
                    onChange={() => setActiveKey(reference.key)}
                    className="sr-only"
                  />
                  {reference.label}
                </label>
              );
            })}
          </div>

          {/* The non-visual equivalent. Not a caption for the drawing — it is
              the drawing's information, written out. */}
          <p className="text-[0.9375rem] leading-relaxed text-muted" aria-live="polite">
            {describe(dimensions, active)}
          </p>
        </div>
      </div>
    </section>
  );
}

function describe(piece: Dimensions, reference: Reference): string {
  const widthPercent = Math.round((piece.widthIn / reference.widthIn) * 100);
  const lengthPercent = Math.round((piece.lengthIn / reference.lengthIn) * 100);

  const coverage =
    widthPercent >= 100 && lengthPercent >= 100
      ? "covers it completely, with some to drape over the sides"
      : widthPercent >= 95 && lengthPercent >= 80
        ? "covers nearly all of it"
        : widthPercent >= 70 || lengthPercent >= 70
          ? "covers most of it — a generous layer rather than a full cover"
          : "sits as an accent rather than a cover";

  return `At ${piece.widthIn} by ${piece.lengthIn} inches, this piece is about ${widthPercent}% the width and ${lengthPercent}% the length of a ${reference.label.toLowerCase()}. Laid ${reference.surface}, it ${coverage}.`;
}
