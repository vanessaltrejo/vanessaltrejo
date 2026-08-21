"use client";

import { forwardRef } from "react";
import {
  TAB_HEIGHT_PX,
  TAB_SLOT_WIDTH_PX,
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
        className="relative h-[100svh]"
        style={{ zIndex: 10 + index }}
      >
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col justify-center px-6 sm:px-16"
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
          className="absolute top-0 flex items-center justify-center rounded-t-lg text-sm font-medium"
          style={{
            left: index * TAB_SLOT_WIDTH_PX,
            width: TAB_SLOT_WIDTH_PX,
            height: TAB_HEIGHT_PX,
            background: section.background,
            color: section.foreground,
          }}
        >
          {section.tabLabel}
        </button>
      </section>
    );
  }
);
