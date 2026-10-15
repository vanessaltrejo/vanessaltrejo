"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import type { ProjectShowcaseItemCopy } from "@/lib/translations";

// The site's default body font is Times New Roman (see globals.css) — this
// whole grid opts back into the original OS system font instead, set once
// on its own root below so every card inherits it. FolderSection's own
// "Proyectos destacados" heading (a sibling above this grid, not a
// descendant of it) is unaffected either way, and keeps its explicit
// Instrument Serif override regardless.
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type ProjectMeta = {
  previewImage: string;
  sourceUrl?: string;
};

// Structural, non-translated per-project data (preview screenshot + dummy
// links, since the real repos aren't wired up yet) — paired with
// translations.ts's projectsShowcase.items by array index.
const PROJECT_META: ProjectMeta[] = [
  { previewImage: "/projects/proyecto1.png", sourceUrl: "#" },
  { previewImage: "/projects/proyecto2.png", sourceUrl: "#" },
  { previewImage: "/projects/proyecto3.png", sourceUrl: "#" },
  { previewImage: "/projects/proyecto4.png", sourceUrl: "#" },
  { previewImage: "/projects/proyecto5.png", sourceUrl: "#" },
  { previewImage: "/projects/proyecto6.png", sourceUrl: "#" },
];

function GithubIcon({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.32 3.52 1 .11-.79.42-1.32.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function ProjectCard({
  item,
  meta,
  sourceLabel,
  cursorLabel,
}: {
  item: ProjectShowcaseItemCopy;
  meta: ProjectMeta;
  sourceLabel: string;
  cursorLabel: string;
}) {
  return (
    // Dark glass panel — same language as FaqAccordion's bg-white/5 cards
    // and DesktopAppWindow's dark chrome, rather than a plain white card
    // that reads as a foreign element dropped onto Proyectos' own dark
    // background.
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg backdrop-blur-sm">
      {/* cursor-none + data-cursor-label: CustomCursor swaps the native
          pointer here for its own big filled "Visitar Demo" circle,
          matching codalyste.com's own project-preview cursor. */}
      <div
        className="relative flex h-32 cursor-none items-start justify-end gap-1.5 p-2 sm:h-48"
        data-cursor-label={cursorLabel}
      >
        <Image
          src={meta.previewImage}
          alt={item.title}
          fill
          sizes="(min-width: 640px) 25vw, 50vw"
          className="object-cover object-top"
        />
      </div>
      <div className="flex flex-1 items-stretch gap-2 border-t border-white/10 p-3 sm:p-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="truncate text-sm text-white sm:text-base">{item.title}</h3>
            <span className="shrink-0 text-[11px] text-white/45">{item.dateRange}</span>
          </div>
          <p className="truncate text-xs text-white/65 sm:text-sm">{item.description}</p>
        </div>
        {/* Fills the blank space the date's old justify-between placement
            used to leave — a plain icon link instead of the pill that
            used to sit on top of the image above. items-stretch on the
            row makes this match the title+description column's own
            height exactly, rather than just the title row's. */}
        {meta.sourceUrl && (
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={sourceLabel}
            title={sourceLabel}
            className="flex shrink-0 items-center justify-center text-white/50 transition-colors hover:text-white"
          >
            <GithubIcon className="h-6 w-6" />
          </a>
        )}
      </div>
    </div>
  );
}

// 3-column grid of project cards — each one a dark glass panel matching
// the rest of the site (see ProjectCard), rather than a plain white card
// that would stand out against Proyectos' own dark background. 2 columns
// below sm, where 3 would squeeze each card too narrow to read.
export function ProjectsShowcase() {
  const { t } = useLanguage();

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5"
      style={{ fontFamily: SYSTEM_FONT_STACK }}
    >
      {t.projectsShowcase.items.map((item, index) => (
        <ProjectCard
          key={item.title}
          item={item}
          meta={PROJECT_META[index]}
          sourceLabel={t.projectsShowcase.sourceLabel}
          cursorLabel={t.projectsShowcase.cursorLabel}
        />
      ))}
    </div>
  );
}
