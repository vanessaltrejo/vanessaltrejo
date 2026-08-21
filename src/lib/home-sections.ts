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

export const TAB_HEIGHT_PX = 56;
export const TAB_SLOT_WIDTH_PX = 140;

// The "table" the folder sections sit on — same tone as the hero, always
// visible behind the tab row, regardless of which section is active.
// Matches --background in globals.css.
export const TABLE_BACKGROUND = "#f2ede1";
