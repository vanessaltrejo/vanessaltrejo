import { ProjectScreenshot } from "@/components/projects/ProjectScreenshot";
import type { Project } from "@/lib/projects/types";

type ProjectCardProps = {
  project: Project;
  // Only the first cards sit above the fold — those are the ones worth
  // preloading.
  priority?: boolean;
};

// Size of the screenshots, in CSS variables set on the <article> (which is a
// size container, so 100cqw is the row's width):
// The space between the screenshots and from them to the box's left and right
// edges is always --project-gap (globals.css): the same value, so these
// distances match. (The space between one box and the next is
// --project-row-gap, see ProjectsList.) --pad-y is the
// black above and below the screenshots: the same value too below lg, and
// from lg up much more, so the box stands taller than the screenshots it holds.
// --screen-w is the desktop screenshot's width. From lg up it is 45% of the
// row. Below lg the black box takes the full row and the width is whatever is
// left once the phone (9/16 of the desktop's height, in 390:824 proportion —
// 1.2663 total) and the three gaps (left edge, between, right edge) are
// accounted for. The phone screenshot is as tall as the desktop one.
const SIZE_VARIABLES =
  "[--pad-y:var(--project-gap)] lg:[--pad-y:4.25rem] xl:[--pad-y:5.5rem] [--screen-w:calc((100cqw_-_3*var(--project-gap))/1.2663)] lg:[--screen-w:45cqw]";

// One project, one row: a black box with the desktop screenshot and the phone
// screenshot side by side, always on the right, and the project's name and
// description outside it, on the left. Below lg the text goes under the box.
// Everything has square corners. Only the screenshots react to the pointer
// (cursor, hover and link — see ProjectMedia); the black box's padding, the
// text and the empty space around it don't.
export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article
      className={`group/card @container flex flex-col gap-5 lg:flex-row-reverse lg:items-end lg:gap-8 ${SIZE_VARIABLES}`}
    >
      <div className="flex gap-(--project-gap) self-start bg-secondary px-(--project-gap) py-(--pad-y) lg:self-auto">
        <ProjectScreenshot
          title={project.title}
          image={project.previewImage}
          sourceUrl={project.sourceUrl}
          sizes="(min-width: 1024px) 45vw, 75vw"
          priority={priority}
          className="aspect-[16/9] w-[var(--screen-w)]"
        />
        <ProjectScreenshot
          title={`${project.title} — vista móvil`}
          image={project.mobileImage}
          sourceUrl={project.sourceUrl}
          sizes="200px"
          className="aspect-[390/824] h-[calc(var(--screen-w)*9/16)]"
        />
      </div>

      {/* Where the text sits under its box (below lg), the rows are so close
          that without this space it would read as the caption of the next box. */}
      <div className="flex min-w-0 flex-1 flex-col justify-end max-lg:pb-10">
        <h2 className="text-lg text-secondary">{project.title}</h2>
        <p className="mt-1.5 max-w-xs text-sm leading-6 text-neutral-600">
          {project.description}
        </p>
      </div>
    </article>
  );
}
