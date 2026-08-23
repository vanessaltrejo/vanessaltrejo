export type Language = "es" | "en";

export const LANGUAGE_LOCALE: Record<Language, string> = {
  es: "es-MX",
  en: "en-US",
};

export type SectionCopy = {
  tabLabel: string;
  title: string;
  description: string;
};

type FaqItemCopy = {
  question: string;
  answer: string;
};

export type Translations = {
  menuBar: {
    portfolioLabel: string;
    goHome: string;
  };
  hero: {
    hello: string;
    name: string;
    subtitle: string;
  };
  // Keyed by HomeSection.id (see src/lib/home-sections.ts) so each
  // section's translated copy can be looked up directly by id, without a
  // second id-to-key remapping table.
  sections: Record<string, SectionCopy>;
  dock: {
    finder: string;
    mail: string;
    calendar: string;
    notes: string;
    downloadsCv: string;
    cvFileLabel: string;
  };
  notes: {
    windowTitle: string;
    sidebarToday: string;
    heading: string;
    description: string;
    steps: [string, string, string];
    fields: {
      // No separate placeholder — the floating-label fields use the label
      // itself as the resting hint text (see NotesContactCard's
      // FloatingInput/FloatingTextarea).
      name: { label: string };
      email: { label: string };
      brand: { label: string };
      website: { label: string };
      project: { label: string };
      // The select isn't a floating-label field (there's no natural
      // "empty" placeholder state for a <select>'s own text), so it keeps
      // a real placeholder option instead.
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
    windowTitle: string;
    heading: string;
    description: string;
    items: FaqItemCopy[];
  };
};

export const translations: Record<Language, Translations> = {
  es: {
    menuBar: {
      portfolioLabel: "Mi portafolio",
      goHome: "Ir al inicio",
    },
    hero: {
      hello: "Hola",
      name: "Soy Vanessa Trejo",
      subtitle: "Transformo ideas en soluciones inteligentes.",
    },
    sections: {
      proyectos: {
        tabLabel: "Proyectos",
        title: "Proyectos destacados",
        description:
          "Una selección de trabajos recientes. El contenido real llega pronto.",
      },
      "sobre-mi": {
        tabLabel: "Sobre mí",
        title: "Sobre mí",
        description:
          "Desarrolladora full-stack freelance, especializada en frontend.",
      },
      habilidades: {
        tabLabel: "Habilidades",
        title: "Habilidades",
        description: "Las herramientas y tecnologías con las que trabajo.",
      },
      contacto: {
        tabLabel: "Contacto",
        title: "Hablemos",
        description: "¿Tienes un proyecto en mente? Escríbeme.",
      },
    },
    dock: {
      finder: "Finder",
      mail: "Mail",
      calendar: "Calendario",
      notes: "Notas",
      downloadsCv: "Descargas — CV",
      cvFileLabel: "CV — Vanessa Trejo.pdf",
    },
    notes: {
      windowTitle: "Notas",
      sidebarToday: "Hoy",
      heading: "Trabajemos juntos",
      description:
        "¿Tienes un proyecto en mente? Cuéntame de qué se trata y te respondo directo a tu correo.",
      steps: ["Contacto", "Marca", "Proyecto"],
      fields: {
        name: { label: "Nombre" },
        email: { label: "Correo" },
        brand: { label: "Nombre de tu marca/empresa" },
        website: { label: "Sitio web o cuenta" },
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
      windowTitle: "Notas",
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
  },
  en: {
    menuBar: {
      portfolioLabel: "My portfolio",
      goHome: "Go to home",
    },
    hero: {
      hello: "Hello",
      name: "I'm Vanessa Trejo",
      subtitle: "I turn ideas into smart solutions.",
    },
    sections: {
      proyectos: {
        tabLabel: "Projects",
        title: "Featured projects",
        description: "A selection of recent work. Real content coming soon.",
      },
      "sobre-mi": {
        tabLabel: "About",
        title: "About me",
        description: "Freelance full-stack developer, focused on frontend.",
      },
      habilidades: {
        tabLabel: "Skills",
        title: "Skills",
        description: "The tools and technologies I work with.",
      },
      contacto: {
        tabLabel: "Contact",
        title: "Let's talk",
        description: "Got a project in mind? Write to me.",
      },
    },
    dock: {
      finder: "Finder",
      mail: "Mail",
      calendar: "Calendar",
      notes: "Notes",
      downloadsCv: "Downloads — CV",
      cvFileLabel: "CV — Vanessa Trejo.pdf",
    },
    notes: {
      windowTitle: "Notes",
      sidebarToday: "Today",
      heading: "Let's work together",
      description:
        "Got a project in mind? Tell me about it and I'll reply straight to your email.",
      steps: ["Contact", "Brand", "Project"],
      fields: {
        name: { label: "Name" },
        email: { label: "Email" },
        brand: { label: "Your brand/company name" },
        website: { label: "Website or account" },
        project: { label: "Tell me about your project" },
        budget: {
          label: "Estimated budget",
          placeholder: "Select a range",
        },
      },
      budgetOptions: [
        "Under $500 USD",
        "$500 – $1,500 USD",
        "$1,500 – $5,000 USD",
        "$5,000 – $15,000 USD",
        "Over $15,000 USD",
        "Not sure yet",
      ],
      back: "← Back",
      continueLabel: "Continue →",
      submit: "Send",
      email: {
        subjectPrefix: "Let's work together —",
        unnamedFallback: "no name given",
        brandLabel: "Brand/company",
        websiteLabel: "Site or account",
        budgetLabel: "Estimated budget",
        unspecified: "—",
      },
    },
    faq: {
      windowTitle: "Notes",
      heading: "Frequently asked questions",
      description: "What people ask most before we start a project.",
      items: [
        {
          question: "What's your work process like?",
          answer:
            "We start with a call to understand your project, I send a proposal with scope and timeline, and we move in sprints with reviewable deliverables.",
        },
        {
          question: "How long does a project take?",
          answer:
            "It depends on scope — a simple site can take 1-2 weeks, a more complete product can take several months. I'll give you a clear estimate before we start.",
        },
        {
          question: "Do you work remotely?",
          answer:
            "Yes, I work 100% remote with clients across different time zones. We coordinate over video calls and messages, whatever works best for both of us.",
        },
        {
          question: "How do you charge?",
          answer:
            "By project with a defined scope, or hourly if the work is more open-ended. I share the details in the proposal before we start — no surprises.",
        },
      ],
    },
  },
};
