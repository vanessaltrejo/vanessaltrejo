import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/projects/types";

type ProjectsListProps = {
  projects: Project[];
};

// One row per project, so only the first couple can be on screen on load.
const PRIORITY_IMAGE_COUNT = 2;

export function ProjectsList({ projects }: ProjectsListProps) {
  return (
    // The rows sit close to each other: the space is --project-row-gap.
    <ul className="mt-8 flex w-full flex-col gap-(--project-row-gap) sm:mt-12">
      {projects.map((project, index) => (
        <li key={project.id}>
          <ProjectCard
            project={project}
            priority={index < PRIORITY_IMAGE_COUNT}
          />
        </li>
      ))}
    </ul>
  );
}
