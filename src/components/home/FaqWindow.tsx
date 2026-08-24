"use client";

import { DesktopAppWindow } from "@/components/home/DesktopAppWindow";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { useLanguage } from "@/lib/language-context";

// The site's default body font is Times New Roman (see globals.css) — this
// window's description opts back into the original OS system font instead
// (its heading stays Instrument Serif, unchanged).
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function FaqWindow() {
  const { t } = useLanguage();

  return (
    <DesktopAppWindow title={t.faq.windowTitle} className="h-full w-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8 sm:py-8">
        <h2
          className="text-2xl text-white sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          {t.faq.heading}
        </h2>
        <p
          className="mt-2 max-w-md text-sm text-white/60"
          style={{ fontFamily: SYSTEM_FONT_STACK }}
        >
          {t.faq.description}
        </p>

        <div className="mt-6">
          <FaqAccordion />
        </div>
      </div>
    </DesktopAppWindow>
  );
}
