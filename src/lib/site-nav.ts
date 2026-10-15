// Every public view of the site, in navbar order. Each one is its own
// route (see src/app/(site)) and shares this single source for its navbar
// label and its page heading, so the two can't drift apart.
export type SiteViewId = "home" | "projects" | "experience" | "about" | "contact";

export type SiteView = {
  id: SiteViewId;
  href: string;
  navLabel: string;
  heading: string;
  // Optional — a view without an intro line just shows its heading.
  description?: string;
};

export const siteViews: Record<SiteViewId, SiteView> = {
  home: {
    id: "home",
    href: "/",
    navLabel: "Inicio",
    heading: "Vanessa Trejo",
  },
  projects: {
    id: "projects",
    href: "/proyectos",
    navLabel: "Proyectos",
    heading: "Proyectos",
    description:
      "Una selección de trabajos recientes. El contenido real llega pronto.",
  },
  experience: {
    id: "experience",
    href: "/experiencia",
    navLabel: "Experiencia",
    heading: "Experiencia",
    description:
      "Desarrolladora full-stack freelance, especializada en frontend.",
  },
  about: {
    id: "about",
    href: "/sobre-mi",
    navLabel: "Sobre mí",
    heading: "Sobre mí",
    description: "Las herramientas y tecnologías con las que trabajo.",
  },
  contact: {
    id: "contact",
    href: "/contacto",
    navLabel: "Contacto",
    heading: "Contacto",
  },
};

export const siteNavItems: SiteView[] = [
  siteViews.home,
  siteViews.projects,
  siteViews.experience,
  siteViews.about,
  siteViews.contact,
];
