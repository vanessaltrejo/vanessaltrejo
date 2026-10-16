import Image from "next/image";
import {
  ProjectMediaLink,
  ProjectMediaWash,
} from "@/components/projects/ProjectMedia";

type ProjectScreenshotProps = {
  // Name announced for the link and the image's alt text.
  title: string;
  // Missing while the real screenshot doesn't exist yet — a neutral block
  // takes its place.
  image?: string;
  sourceUrl?: string;
  sizes: string;
  priority?: boolean;
  // Sets the shape and size (each screenshot comes in its own proportion).
  className?: string;
};

// One screenshot of a project, desktop or phone view — the same plain,
// square-cornered rectangle in both cases. It expects an ancestor with the `group/card` class
// (see ProjectCard) so every screenshot of the card washes out together.
export function ProjectScreenshot({
  title,
  image,
  sourceUrl,
  sizes,
  priority = false,
  className = "",
}: ProjectScreenshotProps) {
  return (
    <ProjectMediaLink
      label={title}
      sourceUrl={sourceUrl}
      className={`relative shrink-0 overflow-hidden bg-neutral-100 ${className}`}
    >
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-top"
        />
      )}
      <ProjectMediaWash />
    </ProjectMediaLink>
  );
}
