"use client";

import { forwardRef } from "react";
import { createPortal } from "react-dom";
import {
  TAB_HEIGHT_PX,
  TAB_SLOT_WIDTH_PX,
  type HomeSection,
} from "@/lib/home-sections";

type FolderSectionProps = {
  section: HomeSection;
  index: number;
  tabProgress: number;
  tabsLayer: HTMLDivElement | null;
  onTabClick: (index: number) => void;
};

export const FolderSection = forwardRef<HTMLElement, FolderSectionProps>(
  function FolderSection(
    { section, index, tabProgress, tabsLayer, onTabClick },
    ref
  ) {
    return (
      <section
        ref={ref}
        id={section.id}
        className="relative flex h-[100svh] flex-col justify-center px-6 sm:px-16"
        style={{
          zIndex: 10 + index,
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

        {tabProgress > 0 &&
          tabsLayer &&
          createPortal(
            <button
              type="button"
              onClick={() => onTabClick(index)}
              className="pointer-events-auto absolute top-0 flex items-center justify-center rounded-t-lg text-sm font-medium"
              style={{
                left: index * TAB_SLOT_WIDTH_PX,
                width: TAB_SLOT_WIDTH_PX,
                height: TAB_HEIGHT_PX,
                background: section.background,
                color: section.foreground,
                transform: `translateY(${(1 - tabProgress) * TAB_HEIGHT_PX}px)`,
              }}
            >
              {section.tabLabel}
            </button>,
            tabsLayer
          )}
      </section>
    );
  }
);
