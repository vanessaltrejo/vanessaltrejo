export type ProjectStatus = "planning" | "in-progress" | "done";

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  updatedAt: string;
};

export const dummyProjects: Project[] = [
  {
    id: "1",
    name: "Portfolio personal",
    description: "Sitio de vanessaltrejo.com con login de Google.",
    status: "in-progress",
    updatedAt: "2026-08-18",
  },
  {
    id: "2",
    name: "Landing cliente freelance",
    description: "Landing page para un cliente de e-commerce.",
    status: "planning",
    updatedAt: "2026-08-10",
  },
  {
    id: "3",
    name: "API de tareas",
    description: "Primer backend propio para practicar Node y bases de datos.",
    status: "planning",
    updatedAt: "2026-08-05",
  },
];
