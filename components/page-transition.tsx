"use client";

import { usePathname } from "next/navigation";
import { ViewTransition, useLayoutEffect, useRef } from "react";

/**
 * Wraps every page so that moving between them crossfades instead of cutting.
 *
 * Re-keying on the pathname makes React treat the outgoing page and the
 * incoming page as an exit/enter pair, which the browser's View Transitions
 * API animates using the `.page-exit` / `.page-enter` rules in globals.css.
 * Browsers without the API (and anyone with reduced motion on) get the plain
 * instant swap they always had.
 *
 * It also guarantees that a new page opens at its top. Next.js only scrolls
 * when it judges the incoming page to be out of view, which has let a long
 * page hand its scroll position to the next. Two exceptions are respected:
 * a link with a hash fragment keeps its target, and the browser's own
 * back/forward keeps the position the reader left behind.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const traversal = useRef(false);
  const previous = useRef(pathname);

  useLayoutEffect(() => {
    const onPopState = () => {
      traversal.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;

    const cameFromHistory = traversal.current;
    traversal.current = false;
    if (cameFromHistory || window.location.hash) return;

    // `instant` overrides the smooth scroll-behavior on <html>, so this runs
    // inside the same frame as the navigation rather than animating.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
