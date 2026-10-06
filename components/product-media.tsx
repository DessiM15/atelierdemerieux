import Image from "next/image";
import type { ProductImage } from "@/lib/types";

/**
 * Renders a product image, or a woven stand-in when photography hasn't landed.
 *
 * The stand-in is drawn, not fetched: an SVG pattern of chain-stitch loops in
 * the house palette. It reads as a deliberate brand surface rather than a
 * broken image, and it lets every layout on the site be judged at full fidelity
 * before a single photograph exists.
 */

type Tone = "plum" | "cream" | "taupe" | "camel";

const TONES: Record<Tone, { ground: string; thread: string; mark: string }> = {
  plum: { ground: "#2c0c1a", thread: "#6E3448", mark: "#4A1F30" },
  cream: { ground: "#E9DCC3", thread: "#CDBE9F", mark: "#D8CAAC" },
  taupe: { ground: "#6F5E45", thread: "#8F7D5F", mark: "#7F6D4F" },
  camel: { ground: "#BCB09A", thread: "#D4CAB6", mark: "#C8BDA6" },
};

function toneFrom(url: string): Tone {
  const value = url.replace("placeholder:", "");
  return value in TONES ? (value as Tone) : "cream";
}

interface ProductMediaProps {
  image: ProductImage | undefined;
  /** Used to build honest alt text when the image itself carries none. */
  productName: string;
  /** Intrinsic hint for next/image. The wrapper controls display size. */
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /**
   * True when a sibling element already conveys the same information — a card
   * whose heading repeats the product name. The image then gets `alt=""` so a
   * screen reader isn't told the same thing twice (WCAG 1.1.1).
   */
  decorative?: boolean;
}

export function ProductMedia({
  image,
  productName,
  width = 900,
  height = 1125,
  sizes = "(max-width: 640px) 90vw, (max-width: 1100px) 45vw, 30vw",
  priority = false,
  className,
  decorative = false,
}: ProductMediaProps) {
  if (!image || image.placeholder) {
    return (
      <WovenTile
        tone={image ? toneFrom(image.url) : "cream"}
        className={className}
        label={decorative ? undefined : `${productName} — photography to come`}
      />
    );
  }

  return (
    <Image
      src={image.url}
      alt={decorative ? "" : image.alt || productName}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

/* ---------------------------------------------------------------------------
   The stand-in surface
   --------------------------------------------------------------------------- */

export function WovenTile({
  tone = "cream",
  className,
  label,
}: {
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const palette = TONES[tone];
  // Pattern ids must be unique per tone or the first one on the page wins for
  // every subsequent instance.
  const patternId = `stitch-${tone}`;

  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? "img" : "presentation"}
      {...(label ? {} : { "aria-hidden": true })}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      <defs>
        <pattern id={patternId} width="34" height="30" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={palette.thread} strokeWidth="1.5" strokeLinecap="round">
            <ellipse cx="9" cy="15" rx="8" ry="11" />
            <ellipse cx="26" cy="15" rx="8" ry="11" />
            <ellipse cx="17.5" cy="0" rx="8" ry="11" />
            <ellipse cx="17.5" cy="30" rx="8" ry="11" />
          </g>
        </pattern>
      </defs>
      <rect width="400" height="500" fill={palette.ground} />
      <rect width="400" height="500" fill={`url(#${patternId})`} opacity="0.75" />
      <g opacity="0.5">
        <text
          x="200"
          y="262"
          textAnchor="middle"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize="46"
          fill={palette.mark}
        >
          A
        </text>
        <text
          x="218"
          y="262"
          textAnchor="middle"
          fontFamily="var(--font-display), Georgia, serif"
          fontSize="46"
          fill="none"
          stroke={palette.mark}
          strokeWidth="1.2"
        >
          M
        </text>
      </g>
    </svg>
  );
}
