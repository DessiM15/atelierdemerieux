"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CollectionSlide } from "@/lib/collections";

/**
 * The full-bleed homepage hero.
 *
 * One blanket at a time, edge to edge, rotating on a timer. Built to the
 * WAI-ARIA carousel pattern, which matters more here than usual because
 * auto-rotating content is the single most common WCAG failure on a homepage:
 *
 * - Rotation pauses on hover and on keyboard focus, and there is an explicit
 *   pause control (SC 2.2.2, Pause/Stop/Hide). Rotation never starts at all if
 *   the OS asks for reduced motion.
 * - The slide region is `aria-live="polite"` only while rotation is paused, so
 *   a screen reader is told about slides the user asked for and never about
 *   ones the timer picked.
 * - Every slide's content is in the DOM, but inactive slides are `inert`, so
 *   there are no invisible tab stops.
 * - The page <h1> is the collection title and does not change. Each slide's
 *   blanket name is an <h2>, which is what it actually is.
 */

export interface HeroSlide extends CollectionSlide {
  /** Pre-formatted by the server, e.g. "From $225" or "$265". */
  price?: string;
  /** e.g. "Made to order · 18–25 days" or "One of a kind". */
  note?: string;
}

interface HeroCarouselProps {
  eyebrow: string;
  title: string;
  slides: HeroSlide[];
  shopHref: string;
  /** Milliseconds per slide. */
  interval?: number;
}

export function HeroCarousel({
  eyebrow,
  title,
  slides,
  shopHref,
  interval = 6500,
}: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  // `userPaused` is the explicit control; `hovered` and `focused` are the
  // implicit ones. Rotation runs only when all three are clear.
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Progress bars restart from zero on every slide change; bumping this key
  // is how the CSS animation is retriggered without JS timers of its own.
  const [cycle, setCycle] = useState(0);
  const regionId = useId();
  const count = slides.length;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const sync = () => setHidden(document.visibilityState === "hidden");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const playing = count > 1 && !userPaused && !hovered && !focused && !reducedMotion && !hidden;

  const go = useCallback(
    (next: number) => {
      setActive(((next % count) + count) % count);
      setCycle((value) => value + 1);
    },
    [count],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => go(active + 1), interval);
    return () => window.clearTimeout(timer);
  }, [playing, active, interval, go, cycle]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
  };

  // Touch: a horizontal swipe of more than 48px changes slide.
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) < 48) return;
    go(delta < 0 ? active + 1 : active - 1);
  };

  const current = slides[active]!;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      className="hero relative isolate w-full overflow-hidden bg-tamarind text-cream"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* --- photographs, stacked and cross-faded --------------------------- */}
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            key={slide.slug}
            className="hero-frame absolute inset-0"
            data-active={index === active}
          >
            <Image
              src={slide.image.src}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              quality={82}
              className="object-cover"
              style={{ objectPosition: slide.focus }}
            />
          </div>
        ))}
        {/* Two gradients: one up from the floor so the copy reads on any
            photograph, one in from the left so the headline has room. */}
        <div className="absolute inset-0 bg-gradient-to-t from-roast/85 via-roast/35 to-roast/10" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-roast/60 via-roast/15 to-transparent lg:block" />
      </div>

      {/* --- copy -------------------------------------------------------- */}
      <div className="relative flex h-full flex-col justify-end">
        <div className="shell pb-10 pt-44 sm:pb-14 sm:pt-56 lg:pb-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div className="on-dark min-w-0 max-w-[40rem] bg-transparent">
              <p className="eyebrow mb-5 !text-camel-light">
                {eyebrow} <span aria-hidden="true">·</span> <span className="sr-only">,</span>
                <span className="numeric">
                  {String(active + 1).padStart(2, "0")}
                  <span aria-hidden="true"> / </span>
                  <span className="sr-only"> of </span>
                  {String(count).padStart(2, "0")}
                </span>
              </p>

              <h1 className="tracked text-[0.8125rem] text-cream/90 sm:text-[0.9375rem]">{title}</h1>

              {/* Only the active slide is announced; the others exist for
                  layout stability and are inert. */}
              <div
                id={regionId}
                aria-live={playing ? "off" : "polite"}
                aria-atomic="true"
                className="mt-4 grid grid-cols-[minmax(0,1fr)]"
              >
                {slides.map((slide, index) => {
                  const isActive = index === active;
                  return (
                    <div
                      key={slide.slug}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} of ${count}`}
                      {...(isActive ? {} : { inert: true, "aria-hidden": true })}
                      className={`hero-copy col-start-1 row-start-1 min-w-0 max-w-full ${isActive ? "" : "pointer-events-none"}`}
                      data-active={isActive}
                    >
                      <h2 className="display-xl">{slide.name}</h2>
                      <p className="prose-editorial mt-5 text-cream/90">{slide.line}</p>

                      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] uppercase tracking-[0.18em] text-camel-light">
                        {slide.price ? <span className="numeric text-cream">{slide.price}</span> : null}
                        {slide.note ? <span>{slide.note}</span> : null}
                      </p>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={shopHref} className="btn btn-inverse">
                          Shop the collection
                        </Link>
                        <Link
                          href={`/shop/${slide.slug}`}
                          className="btn border-cream/60 text-cream hover:border-cream hover:bg-cream/10"
                        >
                          View this blanket
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* --- controls ----------------------------------------------- */}
            {count > 1 ? (
              <div className="on-dark flex flex-col gap-4 bg-transparent lg:items-end">
                <div
                  role="tablist"
                  aria-label="Choose a blanket"
                  className="flex items-center gap-2"
                >
                  {slides.map((slide, index) => {
                    const isActive = index === active;
                    return (
                      <button
                        key={slide.slug}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={regionId}
                        aria-label={`${slide.name}, ${index + 1} of ${count}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => go(index)}
                        className="group flex h-11 w-9 items-center sm:w-12"
                      >
                        <span className="relative block h-px w-full overflow-hidden bg-cream/35 transition-[height] group-hover:h-0.5">
                          <span
                            key={isActive ? cycle : -1}
                            className="hero-progress absolute inset-y-0 left-0 bg-cream"
                            data-active={isActive}
                            data-playing={playing}
                            style={{ animationDuration: `${interval}ms` }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => go(active - 1)}
                    className="flex size-11 items-center justify-center border border-cream/40 transition-colors hover:border-cream"
                    aria-label="Previous blanket"
                  >
                    <Chevron direction="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(active + 1)}
                    className="flex size-11 items-center justify-center border border-cream/40 transition-colors hover:border-cream"
                    aria-label="Next blanket"
                  >
                    <Chevron direction="right" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserPaused((value) => !value)}
                    aria-pressed={userPaused}
                    className="ml-2 flex min-h-11 items-center gap-2 px-2 text-[0.65rem] uppercase tracking-[0.22em] text-cream/85 hover:text-cream"
                  >
                    {userPaused ? <PlayIcon /> : <PauseIcon />}
                    {userPaused ? "Play" : "Pause"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Announced only on a manual change, so the timer stays silent. */}
      <p className="sr-only" aria-live={playing ? "off" : "polite"}>
        {`Showing ${current.name}`}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------------- */

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-3.5 ${direction === "left" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 2l6 6-6 6" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="2" y="1" width="3" height="10" />
      <rect x="7" y="1" width="3" height="10" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-2.5" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M2.5 1.5v9l8-4.5z" />
    </svg>
  );
}
