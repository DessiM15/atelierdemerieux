import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HookMark, WordmarkStacked } from "@/components/marks";
import { Monogram } from "@/components/wordmark";

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
 * PLACEHOLDER: the photograph is a shop image standing in until Sydney's
 * home shot arrives. Drop it in `public/opener/home.jpg` and change the src.
 */
export default function OpenerPage() {
  return (
    <main id="main" tabIndex={-1} className="opener relative isolate min-h-[100svh] overflow-hidden text-cream">
      {/* --- the photograph (data-opener="photo") ---------------------- */}
      <div className="opener-photo absolute inset-0" aria-hidden="true">
        <Image
          src="/products/autumn-blanket-2.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={82}
          className="object-cover object-[50%_45%]"
        />
        <div className="hero-tint-bottom absolute inset-0" />
        <div className="absolute inset-0 bg-roast/25" />
      </div>

      {/* --- the plain ground (data-opener="logo") --------------------- */}
      <div className="opener-ground absolute inset-0" aria-hidden="true" />

      {/* --- chrome: monogram top-left, a quiet way in top-right ------- */}
      <div className="relative flex items-start justify-between px-[var(--spacing-gutter)] pt-6 sm:pt-8">
        <Link href="/" aria-label="Atelier de Merieux — home" className="block">
          <Monogram className="h-9 w-auto sm:h-11" />
        </Link>
        <Link href="/shop" className="nav-link on-dark bg-transparent">
          Enter
        </Link>
      </div>

      {/* --- the mark + the one button -------------------------------- */}
      <div className="relative flex min-h-[calc(100svh-6rem)] flex-col items-center justify-center px-[var(--spacing-gutter)] pb-20 text-center">
        <h1 className="opener-mark w-full max-w-[34rem]">
          <WordmarkStacked className="opener-wordmark mx-auto h-auto w-full" />
          <HookMark className="opener-hook mx-auto h-auto w-full" />
        </h1>

        <Link href="/shop" className="btn btn-inverse mt-10 min-w-[16rem]">
          Shop the collection
        </Link>

        <p className="mt-10 text-[0.75rem] uppercase tracking-[0.22em] opacity-80">
          Handmade in small batches <span aria-hidden="true">·</span> Charlotte, NC
        </p>
      </div>
    </main>
  );
}
