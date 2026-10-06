import type { CSSProperties } from "react";

/**
 * The identity marks.
 *
 * Direction is still being chosen with Sydney (see the logo deck), so the two
 * candidates currently in play live here side by side and the site composes
 * them. Switching the header from one to the other is a single swap in
 * `site-header.tsx`, not a hunt through the codebase.
 *
 * All marks inherit `currentColor` so they reverse correctly on the tamarind
 * sections without a second asset.
 */

interface MarkProps {
  className?: string;
  style?: CSSProperties;
}

/* ---------------------------------------------------------------------------
   The chain-stitch glyph — the first stitch in any crochet piece, reduced to
   interlocking loops. Used alone as the favicon, the loading mark and the
   section divider.
   --------------------------------------------------------------------------- */

export function StitchGlyph({
  className,
  loops = 3,
  title,
}: MarkProps & { loops?: number; title?: string }) {
  const rx = 9;
  const ry = 12;
  const step = 12;
  const width = step * (loops - 1) + rx * 2 + 4;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} 28`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      role={title ? "img" : "presentation"}
      {...(title ? {} : { "aria-hidden": true })}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {Array.from({ length: loops }, (_, index) => (
        <ellipse key={index} cx={rx + 2 + index * step} cy={14} rx={rx} ry={ry} />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   The stacked wordmark. The widest-tracked thing on the site and the reason
   the header has as much vertical room as it does.
   --------------------------------------------------------------------------- */

export function Wordmark({ className, style }: MarkProps) {
  return (
    <span className={className} style={style}>
      <span className="block tracked leading-[1.35] text-[0.8125rem] sm:text-[0.9375rem]">
        Atelier
      </span>
      <span className="block tracked leading-[1.35] text-[0.8125rem] sm:text-[0.9375rem]">
        de Merieux
      </span>
    </span>
  );
}

/** Single-line version, for tight spaces like the footer and the cart drawer. */
export function WordmarkInline({ className }: MarkProps) {
  return (
    <span className={`tracked text-[0.75rem] ${className ?? ""}`}>Atelier de Merieux</span>
  );
}

/* ---------------------------------------------------------------------------
   The A/M monogram — solid A layered over an outlined M, the couture device
   that keeps two letters legible in one square. This is the favicon and the
   packaging stamp.
   --------------------------------------------------------------------------- */

export function Monogram({ className, title }: MarkProps & { title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 36"
      role={title ? "img" : "presentation"}
      {...(title ? {} : { "aria-hidden": true })}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <text
        x="16"
        y="30"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="34"
        fill="currentColor"
      >
        A
      </text>
      <text
        x="29"
        y="30"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        M
      </text>
    </svg>
  );
}
