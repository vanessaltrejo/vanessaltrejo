"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  getFeaturePose,
  getGazeTowards,
  getStraightAheadGaze,
  type Gaze,
  type Point,
} from "@/lib/mascot-gaze";
import {
  MASCOT_FEATURES,
  MASCOT_RING_PATH,
  MASCOT_VIEW_BOX,
  type MascotFeatureId,
} from "@/lib/mascot-shapes";

// How quickly the face catches up with the pointer: every FOLLOW_TAU_MS it
// closes ~63% of the remaining turn. Based on elapsed time, like the custom
// cursor's, so it feels the same whatever the frame rate. Skipped (snaps to
// the pointer) when the visitor prefers reduced motion.
const FOLLOW_TAU_MS = 90;
const MAX_FRAME_MS = 64;
// Below this distance between the current and the target gaze the face is
// considered settled and the animation loop stops.
const SETTLED_DISTANCE = 0.002;

type NavbarMascotProps = {
  // Sets the size (the ring's proportions fix the width from the height).
  className?: string;
};

// The face in the navbar's corner: a round head whose face sits on a sphere
// and turns to look at the pink cursor. With no pointer over the page — before
// the first move, after it leaves the window, or on touch screens — it looks
// straight ahead. Clicking it opens the login page.
export function NavbarMascot({ className = "" }: NavbarMascotProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const featureRefs = useRef<Partial<Record<MascotFeatureId, SVGGElement | null>>>(
    {}
  );

  useEffect(() => {
    const root = rootRef.current;
    // Same condition as the custom cursor: only where there is a real
    // hovering pointer. Touch screens keep the face looking ahead.
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!root || !canHover) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let pointer: Point | null = null;
    const gaze: Gaze = getStraightAheadGaze();
    let frameId = 0;
    let lastFrameTime = 0;

    function paint() {
      for (const feature of MASCOT_FEATURES) {
        const element = featureRefs.current[feature.id];
        if (!element) continue;

        const pose = getFeaturePose(feature, gaze);
        element.setAttribute("transform", pose.transform);
        element.setAttribute("opacity", String(pose.opacity));
      }
    }

    function step(now: number) {
      if (!root) return;

      const bounds = root.getBoundingClientRect();
      const target = pointer
        ? getGazeTowards(pointer, {
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          })
        : getStraightAheadGaze();

      const elapsed = Math.min(now - lastFrameTime, MAX_FRAME_MS);
      lastFrameTime = now;
      const share = prefersReducedMotion
        ? 1
        : 1 - Math.exp(-elapsed / FOLLOW_TAU_MS);

      gaze.x += (target.x - gaze.x) * share;
      gaze.y += (target.y - gaze.y) * share;
      paint();

      const isSettled =
        Math.hypot(target.x - gaze.x, target.y - gaze.y) < SETTLED_DISTANCE;
      frameId = isSettled ? 0 : requestAnimationFrame(step);
    }

    function startAnimating() {
      if (frameId !== 0) return;
      lastFrameTime = performance.now();
      frameId = requestAnimationFrame(step);
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      startAnimating();
    }

    function handleDocumentLeave() {
      pointer = null;
      startAnimating();
    }

    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener("mouseleave", handleDocumentLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleDocumentLeave
      );
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <Link
      ref={rootRef}
      href="/login"
      aria-label="Iniciar sesión"
      className={`block aspect-[768/728] shrink-0 select-none ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${MASCOT_VIEW_BOX.width} ${MASCOT_VIEW_BOX.height}`}
        className="block h-full w-full"
      >
        <path d={MASCOT_RING_PATH} fillRule="evenodd" className="fill-secondary" />
        {MASCOT_FEATURES.map((feature) => (
          <g
            key={feature.id}
            ref={(element) => {
              featureRefs.current[feature.id] = element;
            }}
          >
            <path d={feature.path} className="fill-secondary" />
          </g>
        ))}
      </svg>
    </Link>
  );
}
