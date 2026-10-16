import type { ReactNode } from "react";
import { cursorProjectProps } from "@/lib/cursor";

type ProjectMediaLinkProps = {
  // Name announced for the link — the media itself is only an image.
  label: string;
  // Only set once the real repo/demo exists — links out when present.
  sourceUrl?: string;
  className?: string;
  children: ReactNode;
};

// The interactive surface of a project: the desktop screen and the phone each
// use one. They are the only elements of a card tagged with the cursor props,
// so they are the only places that turn the cursor into the ↗ ring (and the
// only clickable ones) — the white space and the text around them are not.
export function ProjectMediaLink({
  label,
  sourceUrl,
  className = "",
  children,
}: ProjectMediaLinkProps) {
  if (!sourceUrl) {
    return (
      <div className={className} {...cursorProjectProps}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`block ${className}`}
      {...cursorProjectProps}
    >
      {children}
    </a>
  );
}

// On hover the media washes out to white — no zoom, no movement. It reacts
// when the pointer is on any media of the same card (the `group/card` on the
// <article>), so the screen and the phone fade together.
export function ProjectMediaWash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-primary/0 transition-colors duration-200 group-has-[[data-cursor=project]:hover]/card:bg-primary/40"
    />
  );
}
