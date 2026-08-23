"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import type { Language } from "@/lib/translations";

type LanguageOption = {
  code: Language;
  // Each language names itself, in its own language — same convention as
  // a real macOS language picker, e.g. "Español" always reads "Español"
  // regardless of which language the site is currently showing.
  label: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
];

// A real macOS-style dropdown (dark, rounded, blue hover highlight) —
// backed by the shared language context, so picking one actually
// re-renders the whole homepage's copy.
function LanguageMenu() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const currentLabel = LANGUAGE_OPTIONS.find(
    (option) => option.code === language
  )?.label;

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={`rounded px-1.5 py-0.5 transition-colors ${
          isOpen ? "bg-white/15 text-white" : "text-white/80 hover:text-white"
        }`}
      >
        {currentLabel}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 min-w-[9rem] rounded-md border border-white/10 bg-[#2b2b2e]/95 py-1 text-left shadow-2xl backdrop-blur-md">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1 text-left text-white/90 hover:bg-[#0a6cff] hover:text-white"
            >
              <span className="w-3 text-[10px]">
                {option.code === language ? "✓" : ""}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Menu-bar style clock, e.g. "23 Aug 9:54" — English, no weekday, 24-hour
// time (no am/pm), matching how Vanessa's own Mac menu bar is set. Built
// from the date parts directly rather than a single Intl format string, so
// the day-before-month order and unpadded hour are guaranteed regardless
// of locale defaults. Updated on an interval rather than once, so it stays
// live like a real OS menu bar.
function useMenuBarClock(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

    function tick() {
      const now = new Date();
      const day = now.getDate();
      const month = monthFormatter.format(now);
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setLabel(`${day} ${month} ${hours}:${minutes}`);
    }

    tick();
    const intervalId = window.setInterval(tick, 15_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return label;
}

type DesktopMenuBarProps = {
  onLogoClick: () => void;
};

export function DesktopMenuBar({ onLogoClick }: DesktopMenuBarProps) {
  const { t } = useLanguage();
  const clockLabel = useMenuBarClock();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between border-b border-white/10 bg-black/25 px-3 text-[13px] text-white backdrop-blur-md sm:px-4">
      <div className="flex items-center gap-4 sm:gap-5">
        <button
          type="button"
          onClick={onLogoClick}
          aria-label={t.menuBar.goHome}
          className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[9px] font-black leading-none text-black transition-transform hover:scale-110"
        >
          VT
        </button>
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-tight">
            {t.menuBar.portfolioLabel}
          </span>
          <div className="hidden sm:flex">
            <LanguageMenu />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-white/80 sm:gap-4">
        {/* Vanessa's own wifi artwork (public/icons/wifi.png) — already
            solid white on a transparent background, so it drops straight
            onto the dark menu bar with no color/currentColor wiring
            needed, unlike the other hand-drawn glyphs here. `fill` inside a
            fixed-size wrapper (not width/height props) avoids Next/Image's
            aspect-ratio mismatch warning that a CSS-resized fixed image
            triggers. */}
        <span className="relative inline-block h-3 w-[17px]" aria-hidden="true">
          <Image src="/icons/wifi.png" alt="" fill sizes="17px" className="object-contain" />
        </span>
        <svg
          viewBox="0 0 24 12"
          className="h-3 w-5"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="19"
            height="10"
            rx="2"
            className="fill-none stroke-current"
            strokeWidth="1"
          />
          <rect x="21.5" y="4" width="1.5" height="4" rx="0.5" className="fill-current" />
          <rect x="2.5" y="2.5" width="14" height="7" rx="1" className="fill-current" />
        </svg>
        <span className="min-w-max font-medium tabular-nums">{clockLabel}</span>
      </div>
    </header>
  );
}
