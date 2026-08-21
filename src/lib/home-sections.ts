export type HomeSection = {
  id: string;
  tabLabel: string;
  title: string;
  description: string;
  background: string;
  foreground: string;
};

export const homeSections: HomeSection[] = [
  {
    id: "proyectos",
    tabLabel: "Proyectos",
    title: "Proyectos destacados",
    description:
      "Una selección de trabajos recientes. El contenido real llega pronto.",
    background: "#e9e2d4",
    foreground: "#171410",
  },
  {
    id: "sobre-mi",
    tabLabel: "Sobre mí",
    title: "Sobre mí",
    description:
      "Desarrolladora full-stack freelance, especializada en frontend.",
    background: "#7c8563",
    foreground: "#f6f3ea",
  },
  {
    id: "habilidades",
    tabLabel: "Habilidades",
    title: "Habilidades",
    description: "Las herramientas y tecnologías con las que trabajo.",
    background: "#2f3b4c",
    foreground: "#eef1f4",
  },
  {
    id: "contacto",
    tabLabel: "Contacto",
    title: "Hablemos",
    description: "¿Tienes un proyecto en mente? Escríbeme.",
    background: "#15130f",
    foreground: "#f6f3ea",
  },
];

export const TAB_HEIGHT_PX = 40;
export const TAB_SLOT_WIDTH_PX = 152;

// The "table" the folder sections sit on — same tone as the hero, always
// visible behind the tab row, regardless of which section is active.
// Matches --background in globals.css.
export const TABLE_BACKGROUND = "#f2ede1";

// Desktop-style wallpaper shown behind the hero and through the tab-row
// gaps, reinforcing the "computer desktop" framing of the mini menu bar.
export const TABLE_BACKGROUND_IMAGE = "/wallpaper.jpg";

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
