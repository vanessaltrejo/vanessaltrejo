import type { Project } from "@/lib/projects/types";

// Placeholder projects until the real data source is wired up.
const dummyProjects: Project[] = [
  {
    id: "comedor-de-los-pobres",
    title: "Comedor de los Pobres",
    dateRange: "Ene 2025 – Mar 2025",
    description: "Dashboard con métricas en tiempo real y alertas.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    previewImage: "/projects/proyecto1-desktop.png",
    mobileImage: "/projects/proyecto1-mobile.png",
  },
  {
    id: "apnl",
    title: "APNL",
    dateRange: "Oct 2024 – Dic 2024",
    description: "Landing con pagos y seguimiento de pedidos.",
    tags: ["Next.js", "Stripe", "Prisma", "Tailwind CSS"],
    previewImage: "/projects/proyecto2.png",
  },
  {
    id: "cll-ingenieria",
    title: "CLL Ingeniería",
    dateRange: "Jun 2024 – Ago 2024",
    description: "App para organizar proyectos en tableros.",
    tags: ["React", "TypeScript", "PostgreSQL"],
    previewImage: "/projects/proyecto3.png",
  },
  {
    id: "codalyste",
    title: "Codalyste",
    dateRange: "Feb 2024 – Abr 2024",
    description: "Bot de IA que responde preguntas frecuentes.",
    tags: ["Next.js", "TypeScript", "Stripe"],
    previewImage: "/projects/proyecto4.png",
  },
  {
    id: "revadore",
    title: "Revadore",
    dateRange: "Oct 2023 – Dic 2023",
    description: "Checkout con pagos y stock en vivo.",
    tags: ["Next.js", "Stripe", "Tailwind CSS"],
    previewImage: "/projects/proyecto5.png",
  },
  {
    id: "beetik-architecture",
    title: "Beetik Architecture",
    dateRange: "Jun 2023 – Ago 2023",
    description: "Tableros con recordatorios y colaboración.",
    tags: ["React", "TypeScript", "PostgreSQL"],
    previewImage: "/projects/proyecto6.png",
  },
  {
    id: "proyecto-de-ejemplo-1",
    title: "Proyecto de ejemplo 1",
    dateRange: "Ene 2023 – Mar 2023",
    description: "Dummy data hasta tener el proyecto real.",
    tags: ["Next.js", "TypeScript"],
  },
  {
    id: "proyecto-de-ejemplo-2",
    title: "Proyecto de ejemplo 2",
    dateRange: "Sep 2022 – Dic 2022",
    description: "Dummy data hasta tener el proyecto real.",
    tags: ["React", "Tailwind CSS"],
  },
];

// Async on purpose: swapping this body for a real database/API call later
// won't change any caller.
export async function getProjects(): Promise<Project[]> {
  return dummyProjects;
}
