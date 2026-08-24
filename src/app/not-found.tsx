"use client";

import Link from "next/link";
import { useStoredLanguage } from "@/lib/language-context";
import type { Language } from "@/lib/translations";

const COPY: Record<Language, { heading: string; button: string }> = {
  es: { heading: "Página no encontrada", button: "Volver al inicio" },
  en: { heading: "Page not found", button: "Back to home" },
};

// From Uiverse.io by preet_7613 — a blinking, looking-around face, styled
// via the .face-404 rules in globals.css (kept there, not inline, since
// plain <style> tags aren't scoped in the App Router the way they are in
// styled-jsx).
function BlinkingFace() {
  return (
    <svg className="face-404" viewBox="0 0 320 380">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={25}
      >
        <g className="face__eyes" transform="translate(0,112.5)">
          <g transform="translate(15,0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
          <g transform="translate(230,0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
        </g>
        <rect
          className="face__nose"
          x={132.5}
          y={112.5}
          width={55}
          height={155}
          rx={4}
          ry={4}
        />
        <g transform="translate(65,334)" strokeDasharray="102 102">
          <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
          <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
        </g>
      </g>
    </svg>
  );
}

// No background of its own — same as HeroIntro, this sits directly on the
// body's fixed wallpaper, so a 404 reads as the same "desktop" as the rest
// of the site instead of a plain error screen. Text and image both skipped
// (per the design ask) in favor of the face above.
//
// Shows only the visitor's own last-picked language (read from the same
// localStorage key LanguageProvider writes to), not both at once — this
// route sits outside ScrollExperience's own LanguageProvider, so it can't
// read that choice via context, only via the storage it was persisted to.
// Defaults to Spanish (matching the site's own default) for a first-ever
// visitor with nothing stored yet.
export default function NotFound() {
  const language = useStoredLanguage();
  const copy = COPY[language];

  return (
    <main className="flex h-[100svh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
        <div style={{ color: "#ffffff" }}>
          <BlinkingFace />
        </div>
        <h1
          className="text-6xl sm:text-8xl"
          style={{
            fontFamily: "var(--font-instrument-serif)",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          {copy.heading}
        </h1>
      </div>
      <Link
        href="/"
        className="rounded-full bg-[#ffd60a] px-6 py-2.5 text-sm font-semibold text-[#171410] transition-transform hover:scale-105"
      >
        {copy.button}
      </Link>
    </main>
  );
}
