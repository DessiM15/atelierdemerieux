"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Enables the scroll reveals.
 *
 * The important half of this is what it does NOT do: nothing on the site is
 * hidden by CSS at rest. `.reveal` only becomes invisible once this component
 * has mounted, so with JavaScript disabled, with a failed hydration, or in a
 * crawler, the whole page renders fully visible. The animation is an
 * enhancement layered on top of a working page, never a precondition for
 * reading it.
 *
 * Deliberately simple: on every scroll, resize, route change and DOM change
 * it walks the still-hidden `.reveal` elements and reveals any that are in
 * view. No IntersectionObserver bookkeeping, so there is no state that can
 * get out of sync with the page — an earlier version tracked which elements
 * were "already observed" and could leave a section hidden forever after a
 * client-side navigation.
 *
 * As a final safety net, anything still hidden a few seconds after it first
 * came into view is shown regardless.
 *
 * Respects `prefers-reduced-motion` by never hiding anything at all.
 */
export function RevealController() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    root.classList.add("js-reveal-ready");

    let frame = 0;
    const timers = new Set<number>();

    const reveal = (element: HTMLElement) => {
      if (element.dataset.revealed === "true" || element.dataset.revealQueued === "true") return;
      element.dataset.revealQueued = "true";
      // Stagger siblings so a grid resolves as a sequence rather than a
      // single flash. Capped so a long row never feels slow.
      const delay = Math.min(Number(element.dataset.revealDelay ?? 0), 400);
      const timer = window.setTimeout(() => {
        element.dataset.revealed = "true";
        timers.delete(timer);
      }, delay);
      timers.add(timer);
    };

    const check = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;
      for (const element of document.querySelectorAll<HTMLElement>(
        '.reveal:not([data-revealed="true"]):not([data-reveal-queued="true"])',
      )) {
        const rect = element.getBoundingClientRect();
        // In view, or above the viewport (scrolled past quickly) — either
        // way it should be visible now.
        if (rect.top < limit && rect.bottom > 0) reveal(element);
        else if (rect.bottom <= 0) reveal(element);
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true });

    // Safety net: whatever is still hidden after the page has settled is
    // shown. Better a missed animation than a missing section.
    const safety = window.setInterval(() => {
      const limit = window.innerHeight * 1.5;
      for (const element of document.querySelectorAll<HTMLElement>(
        '.reveal:not([data-revealed="true"])',
      )) {
        if (element.getBoundingClientRect().top < limit) element.dataset.revealed = "true";
      }
    }, 2500);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mutations.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      for (const timer of timers) window.clearTimeout(timer);
      window.clearInterval(safety);
      root.classList.remove("js-reveal-ready");
    };
  }, [pathname]);

  return null;
}
