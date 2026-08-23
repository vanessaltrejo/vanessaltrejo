"use client";

import { forwardRef } from "react";
import {
  TAB_HEIGHT_PX,
  TAB_SLOT_WIDTH_PX,
  getTabClipPath,
  type HomeSectionMeta,
} from "@/lib/home-sections";
import type { SectionCopy } from "@/lib/translations";

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
        className="relative h-[100svh] pointer-events-none [--folder-inset:0.75rem] sm:[--folder-inset:1.5rem] lg:[--folder-inset:max(2.5rem,calc((100vw_-_80rem)/2))]"
        style={{ zIndex: 10 + index }}
      >
        {/* Small side margins (not touched on top/bottom) so the fixed
            wallpaper "table" peeks through on the left and right, making
            this read as a folder resting on the desktop rather than a
            full-bleed panel. */}
        <div
          className="pointer-events-auto absolute bottom-0 left-[var(--folder-inset)] right-[var(--folder-inset)] flex flex-col justify-center px-6 sm:px-16"
          style={{
            top: TAB_HEIGHT_PX,
            background: section.background,
            color: section.foreground,
          }}
        >
          <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {section.title}
          </h2>
          <p className="mt-4 max-w-md text-lg opacity-80">
            {section.description}
          </p>
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
            clipPath: getTabClipPath(),
          }}
        >
          {section.tabLabel}
        </button>
      </section>
    );
  }
);
