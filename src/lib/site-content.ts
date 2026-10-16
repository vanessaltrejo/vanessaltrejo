// Fixed Spanish copy for the pieces that aren't driven by a data service.
// Translation support was removed on purpose and is pending for the end of
// the project — when it comes back, this is the object to turn into a
// per-language dictionary.
export type FaqItemCopy = {
  question: string;
  answer: string;
};

export type SiteContent = {
  notes: {
    heading: string;
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
    items: FaqItemCopy[];
  };
};

export const siteContent: SiteContent = {
  notes: {
    heading: "Trabajemos juntos",
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
};
