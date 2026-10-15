import Image from "next/image";
import { cursorProjectProps } from "@/lib/cursor";
import type { Project } from "@/lib/projects/types";

type ProjectCardProps = {
  project: Project;
  // Only the first cards sit above the fold — those are the ones worth
  // preloading.
  priority?: boolean;
};

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const content = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
        {project.previewImage && (
          <Image
            src={project.previewImage}
            alt={project.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="object-cover object-top"
          />
        )}
        {/* On hover the image washes out to white — no zoom, no movement. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-200 group-hover:bg-primary/40"
        />
      </div>
      {/* The name on the left and the stack in gray on the right, on the
          same line — when both don't fit, the stack drops below. */}
      <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-4 text-[13px] leading-snug sm:text-[15px]">
        <h2 className="text-secondary">{project.title}</h2>
        <p className="text-right text-neutral-500">{project.tags.join(", ")}</p>
      </div>
    </>
  );

  if (!project.sourceUrl) {
    return (
      <article className="group" {...cursorProjectProps}>
        {content}
      </article>
    );
  }

  return (
    <article {...cursorProjectProps}>
      <a
        href={project.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {content}
      </a>
    </article>
  );
}
