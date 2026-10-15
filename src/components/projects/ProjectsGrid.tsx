import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/projects/types";

type ProjectsGridProps = {
  projects: Project[];
};

// The first two rows (2 columns each) can already be on screen on load.
const PRIORITY_IMAGE_COUNT = 4;

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  return (
    // One card per row on phones; two per row from tablets up, desktop
    // included.
    <ul className="mt-8 grid w-full grid-cols-1 gap-x-5 gap-y-10 sm:mt-12 sm:grid-cols-2 sm:gap-y-12">
      {projects.map((project, index) => (
        <li key={project.id}>
          <ProjectCard project={project} priority={index < PRIORITY_IMAGE_COUNT} />
        </li>
      ))}
    </ul>
  );
}
