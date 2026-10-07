/**
 * The two logo studies Sydney liked, as components, so the opener can show
 * either. Both inherit `currentColor` and scale with their container.
 * Drawn to match studies 01 and 05 on the logo canvas.
 */

export function WordmarkStacked({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 240"
      role="img"
      aria-label="Atelier de Merieux — handmade"
      focusable="false"
    >
      <text
        x="280"
        y="92"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontWeight="300"
        fontSize="58"
        letterSpacing="20"
        fill="currentColor"
      >
        ATELIER
      </text>
      <text
        x="280"
        y="158"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontWeight="300"
        fontSize="58"
        letterSpacing="20"
        fill="currentColor"
      >
        DE MERIEUX
      </text>
      <line x1="160" y1="192" x2="400" y2="192" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <text
        x="280"
        y="222"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontWeight="300"
        fontSize="12"
        letterSpacing="8"
        fill="currentColor"
        opacity="0.85"
      >
        HANDMADE
      </text>
    </svg>
  );
}

export function HookMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 220"
      role="img"
      aria-label="Atelier de Merieux — handmade, one at a time"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 194 V 56 C 150 38, 176 36, 178 52" />
        <path d="M178 52 C 178 60, 170 64, 164 60" />
        <path d="M150 130 c -4 0 -4 10 0 10 c 4 0 4 -10 0 -10" opacity="0.6" />
      </g>
      <circle cx="150" cy="196" r="2.6" fill="currentColor" opacity="0.8" />
      <text
        x="208"
        y="92"
        fontFamily="var(--font-serif)"
        fontWeight="300"
        fontSize="40"
        letterSpacing="12"
        fill="currentColor"
      >
        ATELIER
      </text>
      <text
        x="208"
        y="138"
        fontFamily="var(--font-serif)"
        fontWeight="300"
        fontSize="40"
        letterSpacing="12"
        fill="currentColor"
      >
        DE MERIEUX
      </text>
      <text
        x="210"
        y="176"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        fontWeight="400"
        fontSize="19"
        letterSpacing="2"
        fill="currentColor"
        opacity="0.85"
      >
        handmade, one at a time
      </text>
    </svg>
  );
}
