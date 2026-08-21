import type { Project, ProjectStatus } from "@/lib/dummy-projects";

const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planeando",
  "in-progress": "En progreso",
  done: "Terminado",
};

const statusStyles: Record<ProjectStatus, string> = {
  planning: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  "in-progress":
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  done: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {project.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}
        >
          {statusLabels[project.status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {project.description}
      </p>
      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        Actualizado el {project.updatedAt}
      </p>
    </div>
  );
}
