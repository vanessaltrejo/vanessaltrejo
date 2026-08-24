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
  { id: "proyectos", background: "#1a1d29", foreground: "#ffffff" },
  { id: "sobre-mi", background: "#262c36", foreground: "#ffffff" },
  // Labeled "Sobre mí" (see translations.ts's sections.habilidades) — its
  // background now matches what the removed Contacto folder used to have.
  { id: "habilidades", background: "#3d3f4a", foreground: "#ffffff" },
];

export const TAB_HEIGHT_PX = 40;
export const TAB_SLOT_WIDTH_PX = 152;

// The folder stack's own left/right side margin, as a CSS custom property
// (not a plain Tailwind padding) so it can drive both FolderSection's own
// inset AND, via the shared var, any other element (like Hero's text) that
// needs to align to the exact same left edge without duplicating this
// breakpoint-by-breakpoint formula.
export const FOLDER_INSET_VAR_CLASS =
  "[--folder-inset:0.75rem] sm:[--folder-inset:1.5rem] lg:[--folder-inset:max(2.5rem,calc((100vw_-_80rem)/2))]";

// Matches DesktopMenuBar's fixed h-8 bar. The tab stack pins below this
// (plus a little breathing room) instead of at the very top of the
// viewport, so the fixed navbar never covers the topmost tabs. Not
// exported on its own — nothing outside this file needs the navbar height
// by itself, only the derived offset below.
const NAVBAR_HEIGHT_PX = 32;
export const TAB_STACK_TOP_OFFSET_PX = NAVBAR_HEIGHT_PX + 25;

// AppleDock's own fixed-bar height, at the bottom of the viewport.
export const DOCK_HEIGHT_PX = 96;

// Each folder card's own bottom edge, measured up from the viewport
// bottom — clears AppleDock's height, plus a little extra so the card
// visibly ends *before* the dock (revealing the wallpaper table in
// between) instead of stopping exactly flush with it.
export const FOLDER_BOTTOM_INSET_PX = DOCK_HEIGHT_PX + 40;

const TAB_TAPER_PX = 10;
const TAB_CORNER_RADIUS_PX = 9;

// A trapezoid (narrower top, full-width base) with softly rounded top
// corners, sized to exactly fill one tab slot. The taper is small enough
// relative to the height that treating each top corner as ~90° for the
// rounding arc looks right despite the slanted side not being truly
// vertical — a true bisector-accurate arc isn't worth the complexity here.
// Every tab shares this exact same shape (only position/color differ), so
// it's computed once here rather than re-derived on every FolderSection
// render.
const w = TAB_SLOT_WIDTH_PX;
const h = TAB_HEIGHT_PX;
const t = TAB_TAPER_PX;
const r = TAB_CORNER_RADIUS_PX;

export const TAB_CLIP_PATH = `path("M${t + r},0 L${w - t - r},0 A${r},${r} 0 0,1 ${w - t},${r} L${w},${h} L0,${h} L${t},${r} A${r},${r} 0 0,1 ${t + r},0 Z")`;
