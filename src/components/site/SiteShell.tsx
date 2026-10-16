import type { ReactNode } from "react";
import { CustomCursor } from "@/components/site/CustomCursor";
import { SiteNavbar } from "@/components/site/SiteNavbar";
import { INTER_FONT_STACK } from "@/lib/fonts";

// The frame every light page of the site sits in: white surface, Inter, the
// pink cursor and the navbar. Used by the (site) layout and by the global
// 404 page, which lives outside that route group.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div
      // data-light-surface: tells globals.css to paint the page canvas white
      // too, so the scroll bounce never shows the wallpaper behind it.
      data-light-surface=""
      // overflow-x-clip: browsers count 3D-rotated cards by their flat
      // (perspective-less) bounding box, which can poke a few px past the
      // right edge and add a horizontal scrollbar. Clipping at the page edge
      // stops that without creating a scroll container (sticky still works).
      className="flex min-h-screen flex-col overflow-x-clip bg-primary text-secondary"
      style={{ fontFamily: INTER_FONT_STACK }}
    >
      <CustomCursor />
      <SiteNavbar />
      {/* Starts right below the fixed navbar (--navbar-height, see globals.css). */}
      <main className="flex flex-1 flex-col px-(--page-margin) pt-(--navbar-height) pb-10">
        {children}
      </main>
    </div>
  );
}
