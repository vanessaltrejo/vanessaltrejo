"use client";

import { forwardRef } from "react";
import {
  TAB_HEIGHT_PX,
  TAB_SLOT_WIDTH_PX,
  getTabClipPath,
  type HomeSection,
} from "@/lib/home-sections";

type FolderSectionProps = {
  section: HomeSection;
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
        // different breakpoints.
        className="relative h-[100svh] [--folder-inset:0.75rem] sm:[--folder-inset:1.5rem] lg:[--folder-inset:2.5rem]"
        style={{ zIndex: 10 + index }}
      >
        {/* Small side margins (not touched on top/bottom) so the fixed
            wallpaper "table" peeks through on the left and right, making
            this read as a folder resting on the desktop rather than a
            full-bleed panel. */}
        <div
          className="absolute bottom-0 left-[var(--folder-inset)] right-[var(--folder-inset)] flex flex-col justify-center px-6 sm:px-16"
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
          className="absolute top-0 flex items-center justify-center text-sm font-medium"
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
