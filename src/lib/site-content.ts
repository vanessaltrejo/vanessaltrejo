// Fixed Spanish copy for the pieces that aren't driven by a data service.
// Translation support was removed on purpose and is pending for the end of
// the project — when it comes back, this is the object to turn into a
// per-language dictionary.
export type FaqItemCopy = {
  question: string;
  answer: string;
};

export type ExperienceTimelineItem = {
  dateRange: string;
  title: string;
  location: string;
  description: string;
};

export type SiteContent = {
  notes: {
    heading: string;
    description: string;
    steps: [string, string, string];
    fields: {
      name: { label: string };
      email: { label: string; invalidMessage: string };
      brand: { label: string };
      website: { label: string };
      project: { label: string };
      budget: { label: string; placeholder: string };
    };
    budgetOptions: string[];
    back: string;
    continueLabel: string;
    submit: string;
    email: {
      subjectPrefix: string;
      unnamedFallback: string;
      brandLabel: string;
      websiteLabel: string;
      budgetLabel: string;
      unspecified: string;
    };
  };
  faq: {
    heading: string;
    description: string;
    items: FaqItemCopy[];
  };
  experienceShowcase: {
    skillsTitle: string;
    companiesTitle: string;
    timeline: ExperienceTimelineItem[];
  };
};

export const siteContent: SiteContent = {
  notes: {
    heading: "Trabajemos juntos",
    description:
      "¿Tienes un proyecto en mente? Cuéntame de qué se trata y te respondo directo a tu correo.",
    steps: ["Contacto", "Marca", "Proyecto"],
    fields: {
      name: { label: "Nombre" },
      email: { label: "Correo", invalidMessage: "Ingresa un correo válido" },
      brand: { label: "Nombre de tu marca/empresa" },
      website: { label: "Sitio web (opcional)" },
      project: { label: "Cuéntame de tu proyecto" },
      budget: {
        label: "Presupuesto estimado",
        placeholder: "Selecciona un rango",
      },
    },
    budgetOptions: [
      "Menos de $500 USD",
      "$500 – $1,500 USD",
      "$1,500 – $5,000 USD",
      "$5,000 – $15,000 USD",
      "Más de $15,000 USD",
      "Aún no estoy seguro/a",
    ],
    back: "← Atrás",
    continueLabel: "Continuar →",
    submit: "Enviar",
    email: {
      subjectPrefix: "Trabajemos juntos —",
      unnamedFallback: "sin nombre",
      brandLabel: "Marca/empresa",
      websiteLabel: "Sitio o cuenta",
      budgetLabel: "Presupuesto estimado",
      unspecified: "—",
    },
  },
  faq: {
    heading: "Preguntas frecuentes",
    description: "Lo que más me preguntan antes de empezar un proyecto.",
    items: [
      {
        question: "¿Cómo es tu proceso de trabajo?",
        answer:
          "Empezamos con una llamada para entender tu proyecto, te mando una propuesta con alcance y tiempos, y avanzamos en sprints con entregas revisables.",
      },
      {
        question: "¿Cuánto tiempo toma un proyecto?",
        answer:
          "Depende del alcance — un sitio simple puede tomar 1-2 semanas, un producto más completo puede tomar varios meses. Te doy un estimado claro antes de empezar.",
      },
      {
        question: "¿Trabajas remoto?",
        answer:
          "Sí, trabajo 100% remoto con clientes en distintas zonas horarias. Nos coordinamos por videollamada y mensajes según lo que funcione mejor para ambos.",
      },
      {
        question: "¿Cómo cobras?",
        answer:
          "Por proyecto con un alcance definido, o por horas si el trabajo es más abierto. Te comparto el detalle en la propuesta antes de arrancar, sin sorpresas.",
      },
    ],
  },
  experienceShowcase: {
    skillsTitle: "Habilidades",
    companiesTitle: "He colaborado con",
    timeline: [
      {
        dateRange: "2024 — Presente",
        title: "Full-Stack Developer Freelance",
        location: "Remoto",
        description:
          "Desarrollo de sitios y aplicaciones a la medida para clientes independientes, del diseño al despliegue.",
      },
      {
        dateRange: "2023 — 2024",
        title: "Desarrolladora Frontend",
        location: "Monterrey, Nuevo León",
        description:
          "Construcción de interfaces con React y TypeScript, colaborando directo con diseño y producto.",
      },
      {
        dateRange: "2022",
        title: "Primeros proyectos web",
        location: "Autodidacta",
        description:
          "Primeros sitios propios mientras aprendía HTML, CSS y JavaScript desde cero.",
      },
    ],
  },
};
