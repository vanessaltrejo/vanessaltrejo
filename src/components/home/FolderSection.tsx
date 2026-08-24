"use client";

import { forwardRef } from "react";
import {
  TAB_HEIGHT_PX,
  TAB_SLOT_WIDTH_PX,
  FOLDER_INSET_VAR_CLASS,
  FOLDER_BOTTOM_INSET_PX,
  TAB_CLIP_PATH,
  type HomeSectionMeta,
} from "@/lib/home-sections";
import type { SectionCopy } from "@/lib/translations";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase";
import { ExperienceShowcase } from "@/components/home/ExperienceShowcase";

// The site's default body font is Times New Roman (see globals.css) — the
// folder tabs keep the original OS system font instead, matching
// DesktopMenuBar/AppleDock's own chrome typography rather than the page
// content they sit above.
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type FolderSectionProps = {
  // Structural (id/colors) merged with this section's translated copy for
  // the active language — see ScrollExperience, where the two are combined
  // before being passed down.
  section: HomeSectionMeta & SectionCopy;
  index: number;
  onTabClick: (index: number) => void;
};

export const FolderSection = forwardRef<HTMLElement, FolderSectionProps>(
  function FolderSection({ section, index, onTabClick }, ref) {
    return (
      <section
        ref={ref}
        id={section.id}
        // --folder-inset drives both the body's side margin and the tab's
        // left offset below, so the tab row always lines up with the top
        // of the folder card instead of the two drifting out of sync at
        // different breakpoints. At lg+ it matches NotesContactCard/
        // FaqWindow's own inset below (padding, capped by their
        // max-w-7xl/80rem container) instead of staying a flat 2.5rem —
        // otherwise the folder reads noticeably wider than those windows
        // once the viewport is wide enough for that cap to kick in.
        //
        // pointer-events-none on the section itself: every pinned section
        // is stacked full-screen on top of the ones behind it (that's how
        // the folder-stack effect works), so a later section's transparent
        // area — everywhere except its own colored panel and tab — would
        // otherwise sit above earlier sections' tabs in z-order and eat
        // their clicks even though nothing is visibly covering them. Only
        // the two actually-painted children below opt back into receiving
        // pointer events.
        className={`relative h-[100svh] pointer-events-none ${FOLDER_INSET_VAR_CLASS}`}
        style={{ zIndex: 10 + index }}
      >
        {/* Small side margins (not touched on top/bottom) so the fixed
            wallpaper "table" peeks through on the left and right, making
            this read as a folder resting on the desktop rather than a
            full-bleed panel. */}
        <div
          // Rounded on every corner except top-left — that one stays sharp
          // so the tab (which sits flush against it, always starting at
          // this same left edge) reads as physically attached to the
          // card instead of floating just above a rounded gap.
          className="pointer-events-auto absolute left-[var(--folder-inset)] right-[var(--folder-inset)] flex flex-col justify-center rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-4 sm:px-8"
          style={{
            top: TAB_HEIGHT_PX,
            // Stops short of the viewport's bottom edge (unlike the old
            // flush bottom-0) so the wallpaper "table" shows through in a
            // strip above AppleDock, the same way the side insets already
            // let it show through left/right — instead of the card's own
            // background running underneath the dock unseen.
            bottom: FOLDER_BOTTOM_INSET_PX,
            background: section.background,
            color: section.foreground,
          }}
        >
          {/* Same compact, top-aligned title for every folder now (no
              description) — Proyectos just additionally renders its
              project grid below the title. Smaller side padding for
              Proyectos specifically (px-4/8 instead of px-6/16, set
              above) and no max-width cap here, so the grid — and each
              card's own preview image — gets noticeably more room than
              a plain title needs. Experiencia skips this shared title
              entirely — ExperienceShowcase renders its own two, one per
              column, so "Habilidades" reads as equally prominent instead
              of a smaller sub-heading below "Experiencia". */}
          <div className="flex h-full flex-col justify-start gap-4 pb-6 pt-3 sm:gap-6 sm:pt-6">
            {section.id !== "sobre-mi" && (
              <h2
                className="text-2xl leading-tight tracking-tight sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-serif)" }}
              >
                {section.title}
              </h2>
            )}
            {section.id === "proyectos" && <ProjectsShowcase />}
            {section.id === "sobre-mi" && <ExperienceShowcase />}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onTabClick(index)}
          className="pointer-events-auto absolute top-0 flex items-center justify-center text-sm font-medium"
          style={{
            left: `calc(var(--folder-inset) + ${index * TAB_SLOT_WIDTH_PX}px)`,
            width: TAB_SLOT_WIDTH_PX,
            height: TAB_HEIGHT_PX,
            background: section.background,
            color: section.foreground,
            clipPath: TAB_CLIP_PATH,
            fontFamily: SYSTEM_FONT_STACK,
          }}
        >
          {section.tabLabel}
        </button>
      </section>
    );
  }
);
