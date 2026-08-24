"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";
import type { ProjectShowcaseItemCopy } from "@/lib/translations";

// The site's default body font is Times New Roman (see globals.css) — each
// card's own title uses that explicitly (so it stays Times even if the
// site-wide default ever changes), while its description, link pills, and
// tags opt back into the original OS system font instead, for contrast
// against the title.
const TIMES_NEW_ROMAN = "'Times New Roman', Times, serif";
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type ProjectMeta = {
  previewImage: string;
  websiteUrl: string;
  sourceUrl?: string;
};

// Structural, non-translated per-project data (preview screenshot + dummy
// links, since the real websites/repos aren't wired up yet) — paired with
// translations.ts's projectsShowcase.items by array index.
const PROJECT_META: ProjectMeta[] = [
  {
    previewImage: "/projects/proyecto1.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
  {
    previewImage: "/projects/proyecto2.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
  {
    previewImage: "/projects/proyecto3.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
  {
    previewImage: "/projects/proyecto4.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
  {
    previewImage: "/projects/proyecto5.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
  {
    previewImage: "/projects/proyecto6.png",
    websiteUrl: "#",
    sourceUrl: "#",
  },
];

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.5 10h15M10 2.5c2.2 2 3.3 4.8 3.3 7.5s-1.1 5.5-3.3 7.5c-2.2-2-3.3-4.8-3.3-7.5S7.8 4.5 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.32 3.52 1 .11-.79.42-1.32.76-1.62-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function ProjectPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      // relative z-10: the preview image behind it is `position: absolute`
      // (via next/image's `fill`) with no z-index of its own — CSS still
      // paints that above plain in-flow flex siblings like this pill
      // regardless of DOM order, so without its own explicit z-index this
      // pill would render invisibly underneath the image.
      className="relative z-10 flex items-center gap-1 rounded-full bg-black/80 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-black"
      style={{ fontFamily: SYSTEM_FONT_STACK }}
    >
      {icon}
      {label}
    </a>
  );
}

function ProjectCard({
  item,
  meta,
  websiteLabel,
  sourceLabel,
}: {
  item: ProjectShowcaseItemCopy;
  meta: ProjectMeta;
  websiteLabel: string;
  sourceLabel: string;
}) {
  return (
    // Dark glass panel — same language as FaqAccordion's bg-white/5 cards
    // and DesktopAppWindow's dark chrome, rather than a plain white card
    // that reads as a foreign element dropped onto Proyectos' own dark
    // background.
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg backdrop-blur-sm">
      <div className="relative flex h-28 items-start justify-end gap-1.5 p-2 sm:h-40">
        <Image
          src={meta.previewImage}
          alt={item.title}
          fill
          sizes="(min-width: 640px) 25vw, 50vw"
          className="object-cover object-top"
        />
        <ProjectPill href={meta.websiteUrl} label={websiteLabel} icon={<GlobeIcon />} />
        {meta.sourceUrl && (
          <ProjectPill href={meta.sourceUrl} label={sourceLabel} icon={<GithubIcon />} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 border-t border-white/10 p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm text-white sm:text-base"
            style={{ fontFamily: TIMES_NEW_ROMAN }}
          >
            {item.title}
          </h3>
          <span className="shrink-0 text-[11px] text-white/45">{item.dateRange}</span>
        </div>
        <p
          className="truncate text-xs text-white/65 sm:text-sm"
          style={{ fontFamily: SYSTEM_FONT_STACK }}
        >
          {item.description}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium text-white/70"
              style={{ fontFamily: SYSTEM_FONT_STACK }}
            >
              {tag}
            </span>
          ))}
        </div>
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
      {t.projectsShowcase.items.map((item, index) => (
        <ProjectCard
          key={item.title}
          item={item}
          meta={PROJECT_META[index]}
          websiteLabel={t.projectsShowcase.websiteLabel}
          sourceLabel={t.projectsShowcase.sourceLabel}
        />
      ))}
    </div>
  );
}
