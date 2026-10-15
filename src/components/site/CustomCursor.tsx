"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRightIcon } from "@/components/site/icons";
import { CURSOR_PROJECT_SELECTOR } from "@/lib/cursor";

// How quickly the cursor catches up with the pointer: every FOLLOW_TAU_MS it
// closes ~63% of the remaining distance. Based on elapsed time, not on a
// fixed share per frame — a per-frame share makes the cursor lag far more
// whenever the page drops frames (a busy tab, a heavy screen, a slow GPU).
// Skipped entirely (snaps to the pointer) when the visitor prefers reduced
// motion. A single long frame can't make it jump: dt is capped.
const FOLLOW_TAU_MS = 35;
const MAX_FRAME_MS = 64;

// A small dot that follows the mouse and grows into a ring with a diagonal
// arrow over anything tagged with cursorProjectProps (the project cards).
// Only active on devices with a real hovering pointer — touch screens keep
// their normal behavior. Always the site's tertiary pink: a solid dot, and a
// ring that is just an outline with an arrow, no fill.
export function CustomCursor() {
  const positionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setVisible] = useState(false);
  const [isOverProject, setOverProject] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const element = positionRef.current;
    if (!canHover || !element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Tells globals.css to hide the native pointer — only while this
    // component is actually mounted and running.
    document.documentElement.dataset.customCursor = "true";

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasMoved = false;
    let frameId = 0;
    let lastFrameTime = 0;

    function paint() {
      if (!element) return;
      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }

    function step(now: number) {
      const elapsed = Math.min(now - lastFrameTime, MAX_FRAME_MS);
      lastFrameTime = now;
      const share = prefersReducedMotion
        ? 1
        : 1 - Math.exp(-elapsed / FOLLOW_TAU_MS);

      currentX += (targetX - currentX) * share;
      currentY += (targetY - currentY) * share;
      paint();

      const isSettled =
        Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1;
      frameId = isSettled ? 0 : requestAnimationFrame(step);
    }

    function handlePointerMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!hasMoved) {
        // First movement: appear right under the pointer instead of
        // flying in from the top-left corner.
        hasMoved = true;
        currentX = targetX;
        currentY = targetY;
        paint();
        setVisible(true);
      }

      if (frameId === 0) {
        lastFrameTime = performance.now();
        frameId = requestAnimationFrame(step);
      }
    }

    function handlePointerOver(event: PointerEvent) {
      const { target } = event;
      setOverProject(
        target instanceof Element && target.closest(CURSOR_PROJECT_SELECTOR) !== null
      );
    }

    function handleDocumentLeave() {
      setVisible(false);
      setOverProject(false);
    }

    function handleDocumentEnter() {
      if (hasMoved) setVisible(true);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerover", handlePointerOver);
    document.documentElement.addEventListener("mouseleave", handleDocumentLeave);
    document.documentElement.addEventListener("mouseenter", handleDocumentEnter);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerover", handlePointerOver);
      document.documentElement.removeEventListener("mouseleave", handleDocumentLeave);
      document.documentElement.removeEventListener("mouseenter", handleDocumentEnter);
      cancelAnimationFrame(frameId);
      delete document.documentElement.dataset.customCursor;
    };
  }, []);

  return (
    <div
      ref={positionRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 text-tertiary"
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-tertiary transition-[width,height,background-color] duration-200 ${
          isOverProject ? "h-16 w-16 bg-transparent" : "h-3.5 w-3.5 bg-tertiary"
        }`}
      >
        <ArrowUpRightIcon
          className={`h-9 w-9 transition-transform duration-200 ${
            isOverProject ? "scale-100" : "scale-0"
          }`}
        />
      </div>
    </div>
  );
}
