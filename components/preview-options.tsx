"use client";

import { useEffect, useId, useState } from "react";

/**
 * REVIEW TOOL — remove once the design decisions are made.
 *
 * A small floating panel that switches between the design options still
 * being chosen with Sydney: the navigation bar treatment and the hero tint.
 * It writes `data-nav` and `data-tint` onto <html>; everything else is CSS
 * keyed off those attributes, so the real components have no knowledge of
 * the panel and deleting it leaves the site on whatever the defaults are.
 *
 * The choice is remembered in localStorage and applied by an inline script in
 * the root layout before first paint, so there is no flash on reload.
 */

export const PREVIEW_STORAGE_KEY = "adm.preview.v1";

export type NavOption = "cream" | "plum" | "glass";
export type TintOption = "plum" | "natural";

export const NAV_OPTIONS: Array<{ value: NavOption; label: string; hint: string }> = [
  { value: "cream", label: "Cream", hint: "Solid cream bar, as now" },
  { value: "plum", label: "Plum", hint: "Solid plum bar, cream type" },
  { value: "glass", label: "See-through", hint: "Clear over the hero, cream once you scroll" },
];

export const TINT_OPTIONS: Array<{ value: TintOption; label: string; hint: string }> = [
  { value: "natural", label: "Natural", hint: "Neutral shadow, truer colour in the blankets" },
  { value: "plum", label: "Plum wash", hint: "Warm plum shadow over the photographs" },
];

export const PREVIEW_DEFAULTS = { nav: "cream" as NavOption, tint: "natural" as TintOption };

/** Runs before paint. Kept tiny and dependency-free on purpose. */
export const PREVIEW_BOOT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  PREVIEW_STORAGE_KEY,
)})||"{}");var d=document.documentElement;d.dataset.nav=["cream","plum","glass"].indexOf(s.nav)>-1?s.nav:"${PREVIEW_DEFAULTS.nav}";d.dataset.tint=["plum","natural"].indexOf(s.tint)>-1?s.tint:"${PREVIEW_DEFAULTS.tint}";}catch(e){}})();`;

export function PreviewOptions() {
  const [open, setOpen] = useState(false);
  const [nav, setNav] = useState<NavOption>(PREVIEW_DEFAULTS.nav);
  const [tint, setTint] = useState<TintOption>(PREVIEW_DEFAULTS.tint);
  const panelId = useId();

  // Read whatever the boot script already applied.
  useEffect(() => {
    const d = document.documentElement.dataset;
    if (d.nav === "cream" || d.nav === "plum" || d.nav === "glass") setNav(d.nav);
    if (d.tint === "plum" || d.tint === "natural") setTint(d.tint);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.nav = nav;
    document.documentElement.dataset.tint = tint;
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ nav, tint }));
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, [nav, tint]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 text-ink">
      {open ? (
        <div
          id={panelId}
          className="w-[17rem] border border-rule bg-cream p-5 shadow-[0_12px_40px_-12px_rgba(31,8,16,0.35)]"
        >
          <p className="eyebrow mb-4">Design options · for review</p>

          <fieldset className="mb-5">
            <legend className="field-label">Navigation bar</legend>
            <div className="flex flex-col gap-1.5">
              {NAV_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                    nav === option.value ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                  }`}
                >
                  <input
                    type="radio"
                    name="preview-nav"
                    value={option.value}
                    checked={nav === option.value}
                    onChange={() => setNav(option.value)}
                    className="sr-only"
                  />
                  <span className="flex flex-col">
                    <span className="text-[0.8125rem]">{option.label}</span>
                    <span className={`text-[0.6875rem] ${nav === option.value ? "text-cream/75" : "text-muted"}`}>
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="field-label">Hero tint</legend>
            <div className="flex flex-col gap-1.5">
              {TINT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                    tint === option.value ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                  }`}
                >
                  <input
                    type="radio"
                    name="preview-tint"
                    value={option.value}
                    checked={tint === option.value}
                    onChange={() => setTint(option.value)}
                    className="sr-only"
                  />
                  <span className="flex flex-col">
                    <span className="text-[0.8125rem]">{option.label}</span>
                    <span className={`text-[0.6875rem] ${tint === option.value ? "text-cream/75" : "text-muted"}`}>
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 items-center gap-2 border border-ink bg-cream px-4 text-[0.6875rem] uppercase tracking-[0.2em] shadow-[0_8px_24px_-10px_rgba(31,8,16,0.4)] hover:bg-ink hover:text-cream"
      >
        <span className="size-2 rounded-full bg-rubine" aria-hidden="true" />
        {open ? "Close options" : "Design options"}
      </button>
    </div>
  );
}
