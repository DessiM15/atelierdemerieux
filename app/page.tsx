import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HookMark, WordmarkStacked } from "@/components/marks";

export const metadata: Metadata = {
  title: "Handmade crochet, worked one piece at a time",
};

/**
 * The opener. One screen, one button.
 *
 * Two backgrounds and two marks are under review, switched from the Design
 * options panel through `data-opener` and `data-mark` on <html>; everything
 * for both is rendered and CSS shows the chosen pair, so the switch is
 * instant and nothing flashes.
 *
 * The photograph is Sydney's home shot: the olive blanket over a cream chair
 * by the fire, with the city behind. Landscape, so it fills a desktop screen
 * at its natural crop; on phones the blanket stays centred.
 *
 * Getting in has to be obvious. The button breathes, a line under it says
 * what to do, and the whole screen is a tap target: an invisible link covers
 * the photograph and the non-interactive type lets taps fall through to it.
 * That cover is hidden from assistive tech on purpose, since the button and
 * the Enter link are already the accessible way in.
 */
export default function OpenerPage() {
  return (
    <main id="main" tabIndex={-1} className="opener relative isolate min-h-[100svh] overflow-hidden text-cream">
      {/* --- the photograph (data-opener="photo") ---------------------- */}
      <div className="opener-photo absolute inset-0" aria-hidden="true">
        <Image
          src="/opener/home.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={84}
          className="object-cover object-[58%_50%]"
        />
        {/* The photograph is already dark and warm, so the wash is light:
            just enough to settle the type over the fire and the skyline. */}
        <div className="hero-tint-bottom absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-roast/15" />
      </div>

      {/* --- the plain ground (data-opener="logo") --------------------- */}
      <div className="opener-ground absolute inset-0" aria-hidden="true" />

      {/* --- the whole screen is the door ------------------------------ */}
      <Link
        href="/shop"
        className="absolute inset-0 z-0 cursor-pointer"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* --- chrome: just a quiet way in, top-right -------------------- */}
      <div className="pointer-events-none relative z-10 flex items-start justify-end px-[var(--spacing-gutter)] pt-6 sm:pt-8">
        <Link href="/shop" className="nav-link on-dark pointer-events-auto bg-transparent">
          Enter
        </Link>
      </div>

      {/* --- the mark + the one button -------------------------------- */}
      <div className="pointer-events-none relative z-10 flex min-h-[calc(100svh-6rem)] flex-col items-center justify-center px-[var(--spacing-gutter)] pb-20 text-center">
        <h1 className="opener-mark w-full max-w-[34rem]">
          <WordmarkStacked className="opener-wordmark mx-auto h-auto w-full" />
          <HookMark className="opener-hook mx-auto h-auto w-full" />
        </h1>

        <Link href="/shop" className="btn btn-inverse opener-cta pointer-events-auto mt-10 min-w-[16rem]">
          Shop the collection
        </Link>

        <p className="opener-hint mt-5 font-serif text-lg italic tracking-[0.02em] opacity-85">
          <span className="opener-hint-tap">Tap anywhere to come in</span>
          <span className="opener-hint-click">Click anywhere to come in</span>
        </p>

        <p className="mt-10 text-[0.75rem] uppercase tracking-[0.22em] opacity-80">
          Handmade in small batches <span aria-hidden="true">·</span> Charlotte, NC
        </p>
      </div>
    </main>
  );
}
