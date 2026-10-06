"use client";

import { useEffect } from "react";

/**
 * Enables the scroll reveals.
 *
 * The important half of this is what it does NOT do: nothing on the site is
 * hidden by CSS at rest. `.reveal` only becomes invisible once this component
 * has mounted and confirmed `IntersectionObserver` exists — so with JavaScript
 * disabled, with a failed hydration, or in a crawler, the whole page renders
 * fully visible. The animation is an enhancement layered on top of a working
 * page, never a precondition for reading it.
 *
 * It also respects `prefers-reduced-motion` by skipping the hide entirely
 * rather than animating faster.
 */
export function RevealController() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    root.classList.add("js-reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          // Stagger siblings so a grid resolves as a sequence rather than a
          // single flash. Capped so a long row never feels slow.
          const delay = Number(element.dataset.revealDelay ?? 0);
          window.setTimeout(() => {
            element.dataset.revealed = "true";
          }, Math.min(delay, 400));
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    for (const element of elements) {
      // Anything already on screen at load resolves immediately — the first
      // frame should never be a page of blank boxes.
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        element.dataset.revealed = "true";
      } else {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      root.classList.remove("js-reveal-ready");
    };
  }, []);

  return null;
}
