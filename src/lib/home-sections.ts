// Structural data only — tabLabel/title/description live in
// src/lib/translations.ts (keyed by this same id) so every section's copy
// can switch with the site's language. Order here still drives scroll
// index/z-index in ScrollExperience.
export type HomeSectionMeta = {
  id: string;
  background: string;
  foreground: string;
};

export const homeSections: HomeSectionMeta[] = [
  { id: "proyectos", background: "#FFD15C", foreground: "#171410" },
  { id: "sobre-mi", background: "#60D0FF", foreground: "#171410" },
  { id: "habilidades", background: "#7ED321", foreground: "#171410" },
  { id: "contacto", background: "#FF5A5F", foreground: "#171410" },
];

export const TAB_HEIGHT_PX = 40;
export const TAB_SLOT_WIDTH_PX = 152;

// Matches DesktopMenuBar's fixed h-8 bar. The tab stack pins below this
// (plus a little breathing room) instead of at the very top of the
// viewport, so the fixed navbar never covers the topmost tabs. Not
// exported on its own — nothing outside this file needs the navbar height
// by itself, only the derived offset below.
const NAVBAR_HEIGHT_PX = 32;
export const TAB_STACK_TOP_OFFSET_PX = NAVBAR_HEIGHT_PX + 24;

// AppleDock's own fixed-bar height, at the bottom of the viewport.
export const DOCK_HEIGHT_PX = 96;

const TAB_TAPER_PX = 10;
const TAB_CORNER_RADIUS_PX = 9;

// A trapezoid (narrower top, full-width base) with softly rounded top
// corners, sized to exactly fill one tab slot. The taper is small enough
// relative to the height that treating each top corner as ~90° for the
// rounding arc looks right despite the slanted side not being truly
// vertical — a true bisector-accurate arc isn't worth the complexity here.
export function getTabClipPath(): string {
  const w = TAB_SLOT_WIDTH_PX;
  const h = TAB_HEIGHT_PX;
  const t = TAB_TAPER_PX;
  const r = TAB_CORNER_RADIUS_PX;

  return `path("M${t + r},0 L${w - t - r},0 A${r},${r} 0 0,1 ${w - t},${r} L${w},${h} L0,${h} L${t},${r} A${r},${r} 0 0,1 ${t + r},0 Z")`;
}
