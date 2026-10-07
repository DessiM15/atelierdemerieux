"use client";

import { useEffect, useId, useState } from "react";

/**
 * REVIEW TOOL — remove once the design decisions are made.
 *
 * A small floating panel that switches between the design options still
 * being chosen with Sydney. It writes data attributes onto <html>; everything
 * else is CSS keyed off those attributes, so the real components have no
 * knowledge of the panel and deleting it leaves the site on the defaults.
 *
 * The choice is remembered in localStorage and applied by an inline script in
 * the root layout before first paint, so there is no flash on reload. The
 * same keys work as URL parameters (?nav=merlot&heads=plum) for sharing.
 */

export const PREVIEW_STORAGE_KEY = "adm.preview.v2";

export interface OptionGroup {
  key: string;
  label: string;
  values: readonly string[];
  default: string;
  options: ReadonlyArray<{ value: string; label: string; hint: string }>;
}

export const GROUPS: readonly OptionGroup[] = [
  {
    key: "nav",
    label: "Navigation bar",
    values: ["cream", "cream-merlot", "plum", "merlot", "glass"],
    default: "cream",
    options: [
      { value: "cream", label: "Cream · black type", hint: "Solid cream bar, near-black links" },
      { value: "cream-merlot", label: "Cream · merlot type", hint: "Cream bar, merlot links and wordmark. Footer goes merlot" },
      { value: "plum", label: "Plum", hint: "Solid plum bar, cream type" },
      { value: "merlot", label: "Merlot", hint: "Solid merlot bar, cream type. Footer goes merlot too" },
      { value: "glass", label: "See-through", hint: "Clear over the collection panels, cream once you scroll" },
    ],
  },
  {
    key: "heads",
    label: "Headings",
    values: ["ink", "plum", "merlot"],
    default: "ink",
    options: [
      { value: "ink", label: "Ink", hint: "Near-black, as now" },
      { value: "plum", label: "Plum", hint: "Titles and primary buttons in plum" },
      { value: "merlot", label: "Merlot", hint: "Titles and primary buttons in merlot" },
    ],
  },
  {
    key: "opener",
    label: "Opening page",
    values: ["photo", "logo"],
    default: "photo",
    options: [
      { value: "photo", label: "Photograph", hint: "Full-bleed home image behind the mark" },
      { value: "logo", label: "Logo only", hint: "The mark alone on a plain ground" },
    ],
  },
  {
    key: "mark",
    label: "Opening mark",
    values: ["wordmark", "hook"],
    default: "wordmark",
    options: [
      { value: "wordmark", label: "The Wordmark", hint: "Stacked tracked caps, study 01" },
      { value: "hook", label: "The Hook", hint: "Crochet hook beside the name, study 05" },
    ],
  },
  {
    key: "tint",
    label: "Photo tint",
    values: ["natural", "plum"],
    default: "natural",
    options: [
      { value: "natural", label: "Natural", hint: "Neutral shadow on the opener photo" },
      { value: "plum", label: "Plum wash", hint: "Warm plum shadow on the opener photo" },
    ],
  },
];

/** Runs before paint. Kept tiny and dependency-free on purpose. */
export const PREVIEW_BOOT_SCRIPT = `(function(){var K=${JSON.stringify(PREVIEW_STORAGE_KEY)};var G=${JSON.stringify(
  GROUPS.map((group) => [group.key, group.values, group.default]),
)};var s={};try{s=JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){}var changed=false;try{var q=new URLSearchParams(location.search);G.forEach(function(g){var v=q.get(g[0]);if(v&&g[1].indexOf(v)>-1){s[g[0]]=v;changed=true}})}catch(e){}if(changed){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}var d=document.documentElement;G.forEach(function(g){d.dataset[g[0]]=g[1].indexOf(s[g[0]])>-1?s[g[0]]:g[2]})})();`;

type Choices = Record<string, string>;

function defaults(): Choices {
  return Object.fromEntries(GROUPS.map((group) => [group.key, group.default]));
}

export function PreviewOptions() {
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<Choices>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const panelId = useId();

  // Read whatever the boot script already applied.
  useEffect(() => {
    const d = document.documentElement.dataset;
    setChoices((current) => {
      const next = { ...current };
      for (const group of GROUPS) {
        const value = d[group.key];
        if (value && group.values.includes(value)) next[group.key] = value;
      }
      return next;
    });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    for (const group of GROUPS) document.documentElement.dataset[group.key] = choices[group.key] ?? group.default;
    try {
      localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(choices));
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, [choices, hydrated]);

  return (
    <div
      className="fixed inset-x-3 z-[60] flex flex-col items-end gap-2 text-ink sm:inset-x-auto sm:right-4"
      // Kept clear of the strip along the bottom of iPhone Safari that
      // opens the toolbar instead of registering a tap.
      style={{ bottom: "max(1.75rem, calc(env(safe-area-inset-bottom) + 1.25rem))" }}
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Design options"
          className="max-h-[70vh] w-full overflow-y-auto border border-rule bg-cream p-5 shadow-[0_12px_40px_-12px_rgba(31,8,16,0.35)] sm:w-[18rem]"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="eyebrow">Design options · for review</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="-mr-2 flex size-9 items-center justify-center"
              aria-label="Close design options"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {GROUPS.map((group) => (
              <fieldset key={group.key}>
                <legend className="field-label">{group.label}</legend>
                <div className="flex flex-col gap-1.5">
                  {group.options.map((option) => {
                    const selected = (choices[group.key] ?? group.default) === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
                          selected ? "border-ink bg-ink text-cream" : "border-camel hover:border-boho"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`preview-${group.key}`}
                          value={option.value}
                          checked={selected}
                          onChange={() =>
                            setChoices((current) => ({ ...current, [group.key]: option.value }))
                          }
                          className="sr-only"
                        />
                        <span className="flex flex-col">
                          <span className="text-[0.8125rem]">{option.label}</span>
                          <span className={`text-[0.6875rem] ${selected ? "text-cream/75" : "text-muted"}`}>
                            {option.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-12 touch-manipulation items-center gap-2 border border-ink bg-cream px-5 text-[0.6875rem] uppercase tracking-[0.2em] shadow-[0_8px_24px_-10px_rgba(31,8,16,0.4)] hover:bg-ink hover:text-cream"
      >
        <span className="size-2 rounded-full bg-rubine" aria-hidden="true" />
        {open ? "Close options" : "Design options"}
      </button>
    </div>
  );
}
