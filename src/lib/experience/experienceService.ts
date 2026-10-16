import type { ExperienceData } from "@/lib/experience/types";

// Placeholder experience until the real data source is wired up.
const dummyExperience: ExperienceData = {
  experience: [
    {
      id: "fullstack-freelance",
      kind: "freelance",
      dateRange: "2024 — Presente",
      role: "Full-Stack Developer Freelance",
      organization: "Independiente",
      location: "Remoto",
      description:
        "Sitios y aplicaciones a la medida para clientes independientes, del diseño al despliegue.",
    },
    {
      id: "frontend-intern",
      kind: "internship",
      dateRange: "2023 — 2024",
      role: "Practicante de Desarrollo Frontend",
      organization: "Empresa de ejemplo",
      location: "Monterrey, Nuevo León",
      description:
        "Construcción de interfaces con React y TypeScript, colaborando directo con diseño y producto.",
    },
  ],
  hackathons: [
    {
      id: "hackathon-1",
      name: "Hackatón de ejemplo 1",
      organizer: "Organizador de ejemplo",
      year: "2025",
      result: "Finalista",
    },
    {
      id: "hackathon-2",
      name: "Hackatón de ejemplo 2",
      organizer: "Organizador de ejemplo",
      year: "2024",
      result: "1.er lugar",
    },
    {
      id: "hackathon-3",
      name: "Hackatón de ejemplo 3",
      organizer: "Organizador de ejemplo",
      year: "2024",
      result: "Participante",
    },
    {
      id: "hackathon-4",
      name: "Hackatón de ejemplo 4",
      organizer: "Organizador de ejemplo",
      year: "2023",
      result: "Mención especial",
    },
  ],
  companies: Array.from({ length: 10 }, (_, index) => ({
    id: `company-${index + 1}`,
    name: `Empresa ${String(index + 1).padStart(2, "0")}`,
  })),
};

// Async on purpose: swapping this body for a real database/API call later
// won't change any caller.
export async function getExperience(): Promise<ExperienceData> {
  return dummyExperience;
}
