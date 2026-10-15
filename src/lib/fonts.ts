// The site's default body font is Times New Roman (see globals.css). Every
// dashboard component below opts back into the original OS system font via
// this shared constant instead — same stack every other section already
// uses locally (HeroIntro, FolderSection, etc.), just centralized here
// since the dashboard adds a whole new batch of files that all need it.
export const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// The site's display serif (Instrument Serif via next/font) — reserved for
// "big" titles only, same convention as the rest of the site.
export const DISPLAY_SERIF_STYLE = { fontFamily: "var(--font-instrument-serif)" } as const;
