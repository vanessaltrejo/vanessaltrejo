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

export type ProjectShowcaseItemCopy = {
  title: string;
  dateRange: string;
  description: string;
  tags: string[];
};

export type ExperienceTimelineItemCopy = {
  dateRange: string;
  title: string;
  location: string;
  description: string;
};

export type Translations = {
  menuBar: {
    portfolioLabel: string;
    goHome: string;
  };
  hero: {
    hello: string;
    // Name and email are fixed identity fields (like a business card) —
    // same value in both languages. subtitle is a real role description,
    // not an identity field, so it's translated like any other copy.
    name: string;
    subtitle: string;
    email: string;
  };
  // Keyed by HomeSection.id (see src/lib/home-sections.ts) so each
  // section's translated copy can be looked up directly by id, without a
  // second id-to-key remapping table.
  sections: Record<string, SectionCopy>;
  dock: {
    mail: string;
    downloadsCv: string;
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
      email: { label: string; invalidMessage: string };
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
  // Placeholder project cards for the Proyectos folder — swap for real
  // work whenever it's ready (see ProjectsShowcase's own structural data,
  // kept separate: preview colors and website/source links aren't
  // language-dependent).
  projectsShowcase: {
    websiteLabel: string;
    sourceLabel: string;
    items: ProjectShowcaseItemCopy[];
  };
  // Two-column content for the Experiencia folder — a timeline on the left,
  // a skills title (skills list itself still to come) on the right.
  // Placeholder history — swap for the real timeline whenever it's ready.
  experienceShowcase: {
    skillsTitle: string;
    timeline: ExperienceTimelineItemCopy[];
  };
};

export const translations: Record<Language, Translations> = {
  es: {
    menuBar: {
      portfolioLabel: "Mi portafolio",
      goHome: "Ir al inicio",
    },
    hero: {
      hello: "Hola, soy",
      name: "Vanessa Trejo",
      subtitle: "Desarrolladora Full-Stack Freelance",
      email: "vanessalt08@gmail.com",
    },
    sections: {
      proyectos: {
        tabLabel: "Proyectos",
        title: "Proyectos destacados",
        description:
          "Una selección de trabajos recientes. El contenido real llega pronto.",
      },
      "sobre-mi": {
        tabLabel: "Experiencia",
        title: "Experiencia",
        description:
          "Desarrolladora full-stack freelance, especializada en frontend.",
      },
      habilidades: {
        tabLabel: "Sobre mí",
        title: "Sobre mí",
        description: "Las herramientas y tecnologías con las que trabajo.",
      },
      contacto: {
        tabLabel: "Contacto",
        title: "Hablemos",
        description: "¿Tienes un proyecto en mente? Escríbeme.",
      },
    },
    dock: {
      mail: "Correo",
      downloadsCv: "Descargar CV",
    },
    notes: {
      windowTitle: "Formulario",
      sidebarToday: "Hoy",
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
      windowTitle: "FAQ",
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
    projectsShowcase: {
      websiteLabel: "Sitio",
      sourceLabel: "Código",
      items: [
        {
          title: "Comedor de los Pobres",
          dateRange: "Ene 2025 – Mar 2025",
          description:
            "Dashboard para monitorear métricas de negocio en tiempo real, con gráficas y alertas configurables.",
          tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        },
        {
          title: "Asociación de Psicólogos Nuevo León",
          dateRange: "Oct 2024 – Dic 2024",
          description:
            "Landing y checkout para una marca de e-commerce, con pagos integrados y seguimiento de pedidos.",
          tags: ["Next.js", "Stripe", "Prisma", "Tailwind CSS"],
        },
        {
          title: "CLL Ingeniería",
          dateRange: "Jun 2024 – Ago 2024",
          description:
            "Aplicación para organizar proyectos personales en tableros, con recordatorios y colaboración básica.",
          tags: ["React", "TypeScript", "PostgreSQL"],
        },
        {
          title: "Codalyste",
          dateRange: "Feb 2024 – Abr 2024",
          description:
            "Bot que responde preguntas frecuentes de clientes usando modelos de IA, integrado directo al sitio.",
          tags: ["Next.js", "TypeScript", "Stripe"],
        },
      ],
    },
    experienceShowcase: {
      skillsTitle: "Habilidades",
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
  },
  en: {
    menuBar: {
      portfolioLabel: "My portfolio",
      goHome: "Go to home",
    },
    hero: {
      hello: "Hi, I'm",
      name: "Vanessa Trejo",
      subtitle: "Freelance Full-Stack Developer",
      email: "vanessalt08@gmail.com",
    },
    sections: {
      proyectos: {
        tabLabel: "Projects",
        title: "Featured projects",
        description: "A selection of recent work. Real content coming soon.",
      },
      "sobre-mi": {
        tabLabel: "Experience",
        title: "Experience",
        description: "Freelance full-stack developer, focused on frontend.",
      },
      habilidades: {
        tabLabel: "About",
        title: "About me",
        description: "The tools and technologies I work with.",
      },
      contacto: {
        tabLabel: "Contact",
        title: "Let's talk",
        description: "Got a project in mind? Write to me.",
      },
    },
    dock: {
      mail: "Mail",
      downloadsCv: "Download CV",
    },
    notes: {
      windowTitle: "Form",
      sidebarToday: "Today",
      heading: "Let's work together",
      description:
        "Got a project in mind? Tell me about it and I'll reply straight to your email.",
      steps: ["Contact", "Brand", "Project"],
      fields: {
        name: { label: "Name" },
        email: { label: "Email", invalidMessage: "Enter a valid email" },
        brand: { label: "Your brand/company name" },
        website: { label: "Website (optional)" },
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
      windowTitle: "FAQ",
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
    projectsShowcase: {
      websiteLabel: "Website",
      sourceLabel: "Source",
      items: [
        {
          title: "Comedor de los Pobres",
          dateRange: "Jan 2025 – Mar 2025",
          description:
            "Dashboard for tracking real-time business metrics, with charts and configurable alerts.",
          tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
        },
        {
          title: "Asociación de Psicólogos Nuevo León",
          dateRange: "Oct 2024 – Dec 2024",
          description:
            "Landing page and checkout for an e-commerce brand, with integrated payments and order tracking.",
          tags: ["Next.js", "Stripe", "Prisma", "Tailwind CSS"],
        },
        {
          title: "CLL Ingeniería",
          dateRange: "Jun 2024 – Aug 2024",
          description:
            "App for organizing personal projects on boards, with reminders and basic collaboration.",
          tags: ["React", "TypeScript", "PostgreSQL"],
        },
        {
          title: "Codalyste",
          dateRange: "Feb 2024 – Apr 2024",
          description:
            "Bot that answers customer FAQs using AI models, embedded directly on the site.",
          tags: ["Next.js", "TypeScript", "Stripe"],
        },
      ],
    },
    experienceShowcase: {
      skillsTitle: "Skills",
      timeline: [
        {
          dateRange: "2024 — Present",
          title: "Freelance Full-Stack Developer",
          location: "Remote",
          description:
            "Custom sites and applications for independent clients, from design through deployment.",
        },
        {
          dateRange: "2023 — 2024",
          title: "Frontend Developer",
          location: "Monterrey, Nuevo León",
          description:
            "Built interfaces with React and TypeScript, working directly with design and product.",
        },
        {
          dateRange: "2022",
          title: "First web projects",
          location: "Self-taught",
          description:
            "First personal sites while learning HTML, CSS, and JavaScript from scratch.",
        },
      ],
    },
  },
};
