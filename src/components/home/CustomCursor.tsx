"use client";

import { useEffect, useRef } from "react";

// A small dot follows the pointer everywhere on desktop, and morphs on
// hover — a plain ring over any link/button/form field (including its
// floating <label>, which visually covers the field until it's focused or
// filled), or a filled circle with a label over anything tagged
// data-cursor-label (e.g. ProjectsShowcase's preview images) — same
// interaction language as codalyste.com's own cursor, in the site's own
// gold accent instead of their blue. Position updates are applied directly
// via a ref (not React state) since they'd otherwise re-render on every
// single mousemove event.
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Skip entirely on touch/coarse-pointer devices — a mouse-follower
    // cursor doesn't apply there, and there's no hover to morph on anyway.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const labelEl = labelRef.current;
    if (!dot || !labelEl) return;

    function handleMouseMove(event: MouseEvent) {
      dot!.style.opacity = "1";
      dot!.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;

      const target = event.target as HTMLElement;
      const labelTarget = target.closest<HTMLElement>("[data-cursor-label]");
      if (labelTarget) {
        dot!.dataset.mode = "label";
        labelEl!.textContent = labelTarget.dataset.cursorLabel ?? "";
      } else if (target.closest("a, button, input, textarea, select, label")) {
        dot!.dataset.mode = "ring";
      } else {
        dot!.dataset.mode = "default";
      }
    }

    // Hides the dot when the pointer leaves the window entirely, instead
    // of leaving it stranded at the last position it saw.
    function handleMouseLeaveWindow() {
      dot!.style.opacity = "0";
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseleave", handleMouseLeaveWindow);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeaveWindow);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      data-mode="default"
      // group: lets the label span below react to *this* element's own
      // data-mode via group-data-[mode=label]:block, since the mode lives
      // here, not on the span itself.
      className="group pointer-events-none fixed left-0 top-0 z-[9999] hidden h-3 w-3 items-center justify-center rounded-full border-2 border-transparent bg-[#ffd60a] opacity-0 [transition:width_0.3s_cubic-bezier(0.25,1,0.5,1),height_0.3s_cubic-bezier(0.25,1,0.5,1),background-color_0.3s_ease-out,border-color_0.3s_ease-out,opacity_0.3s_ease-out] md:flex data-[mode=label]:h-24 data-[mode=label]:w-24 data-[mode=ring]:h-16 data-[mode=ring]:w-16 data-[mode=ring]:border-[#ffd60a] data-[mode=ring]:bg-transparent"
    >
      <span
        ref={labelRef}
        // whitespace-nowrap: without it, the label wraps onto two lines
        // for the brief moment the circle is still mid-grow (its width
        // transitions from the 12px dot up to 96px), since a two-word
        // label doesn't fit at the in-between widths — it should always
        // read as one line, not flash "Visitar" / "Demo" across two
        // before settling once the circle finishes expanding.
        //
        // scale-0 → scale-100 (not opacity — a fade read as flat/washed
        // out here) — zeroing the scale doubles as hiding it, so there's
        // no separate opacity to manage, and easing (not a spring/bounce)
        // keeps the grow from reading as a "pop". The 0.1s delay holds it
        // at scale-0 until the circle's own grow is mostly done, so the
        // label never reads as text floating outside its circle.
        className="scale-0 select-none whitespace-nowrap px-3 text-center text-xs font-semibold leading-tight text-[#171410] [transition:transform_0.25s_cubic-bezier(0.25,1,0.5,1)_0.1s] group-data-[mode=label]:scale-100"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      />
    </div>
  );
}
