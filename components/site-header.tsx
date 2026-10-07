"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "./cart-provider";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/custom-order", label: "Custom Order" },
  { href: "/meet-the-maker", label: "Meet the Maker" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { itemCount, ready, openCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // A hairline appears under the header once the page has moved, so the bar
  // separates from content without being boxed in at rest.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  // Move focus into the panel when it opens so keyboard and screen-reader
  // users land somewhere useful instead of being left behind the trigger.
  useEffect(() => {
    if (!isMenuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [isMenuOpen]);

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    // Colour, position and the see-through treatment are decided in CSS from
    // `data-nav` on <html> (see components/preview-options.tsx) together with
    // these two attributes, so the markup is identical across the options.
    <header
      className="site-header sticky top-0 z-40 border-b border-transparent backdrop-blur-[2px]"
      data-over-hero={pathname === "/shop"}
      data-scrolled={isScrolled}
    >
      <div className="shell flex items-center justify-between gap-4 py-4 sm:py-5">
        {/* --- mobile menu trigger ------------------------------------- */}
        <button
          ref={menuButtonRef}
          type="button"
          className="-ml-2 flex size-11 items-center justify-center md:hidden"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
          <svg
            viewBox="0 0 20 14"
            className="w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            aria-hidden="true"
            focusable="false"
          >
            {isMenuOpen ? (
              <>
                <line x1="3" y1="2" x2="17" y2="12" />
                <line x1="17" y1="2" x2="3" y2="12" />
              </>
            ) : (
              <>
                <line x1="0" y1="2" x2="20" y2="2" />
                <line x1="0" y1="7" x2="20" y2="7" />
                <line x1="0" y1="12" x2="14" y2="12" />
              </>
            )}
          </svg>
        </button>

        {/* --- desktop nav (left) -------------------------------------- */}
        <nav aria-label="Main" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-link"
                  {...(isCurrent(item.href) ? { "aria-current": "page" as const } : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* --- wordmark ------------------------------------------------ */}
        <Link
          href="/"
          className="shrink-0 text-center md:flex-none"
          aria-label="Atelier de Merieux — home"
        >
          <Wordmark />
        </Link>

        {/* --- bag (right) --------------------------------------------- */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <Link href="/shop/all" className="nav-link hidden lg:inline-block">
            Everything
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="relative flex min-h-11 items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em]"
          >
            <span aria-hidden="true">Bag</span>
            <span
              className="numeric inline-flex min-w-6 items-center justify-center border border-current px-1.5 py-0.5 text-[0.65rem] leading-none"
              aria-hidden="true"
            >
              {ready ? itemCount : 0}
            </span>
            <span className="sr-only">
              {ready
                ? itemCount === 1
                  ? "Open your bag, 1 item"
                  : `Open your bag, ${itemCount} items`
                : "Open your bag"}
            </span>
          </button>
        </div>
      </div>

      {/* --- mobile panel ---------------------------------------------- */}
      <div
        id={menuId}
        ref={menuRef}
        hidden={!isMenuOpen}
        className="border-t border-rule bg-cream text-ink md:hidden"
      >
        <nav aria-label="Main" className="shell py-4">
          <ul className="flex flex-col">
            {[...NAV, { href: "/shop/all", label: "Everything" }].map((item, index) => (
              <li key={`${item.href}-${index}`} className="border-b border-rule last:border-b-0">
                <Link
                  href={item.href}
                  className="block py-4 font-display text-xl"
                  {...(isCurrent(item.href) ? { "aria-current": "page" as const } : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
