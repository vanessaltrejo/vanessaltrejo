"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useSpring,
  type MotionStyle,
} from "motion/react";
import { cursorProjectProps } from "@/lib/cursor";
import type { Project } from "@/lib/projects/types";

// Geometry of the stack, in card widths (so it scales with the screen). The
// horizontal gap between neighbouring cards is the --step-x CSS variable
// (tighter on phones, see the stage below). Every card sits at the same
// depth on purpose, so they all render at the same size.
const BASE_ROTATE_Y_DEG = 58; // how edge-on the cards stand, like CDs in a rack
const CARD_ASPECT = 10 / 16; // card height / card width
// Distance of the "camera". Each card is also turned by the angle at which
// the camera sees it (atan2 below), so every card is seen at the same angle
// and they all render at the same size — without that, perspective shows
// the cards far from the center more and more edge-on.
const PERSPECTIVE_PX = 2000;

// Hover wave: the card under the pointer rises the most, its neighbours
// rise less, so the stack lifts like a hand running along a row of CDs.
const LIFT_Y = -0.2; // fully lifted card, in card widths (negative = up)
const LIFT_REACH = 2; // how many cards away still feel the lift (the width of the wave)
const LIFT_TURN_DEG = 16; // how much a lifted card turns toward the viewer

// The lift follows a spring rather than a fixed-duration transition: a
// spring keeps its velocity when the target changes mid-flight, so running
// the pointer along the row never restarts a card's motion from a standstill
// (which is what makes retargeted CSS transitions look stuttery). Critically
// damped on purpose — it settles without any bounce.
const LIFT_SPRING = { stiffness: 180, damping: 27, mass: 1 } as const;

// How far above its resting spot a card's safe area reaches, in card widths:
// the full lift plus a little slack.
const SAFE_AREA_HEADROOM = 0.22;

// Card width: as wide as it can be while the whole row still fits the
// screen's width (count cards, --step-x apart, plus one card's edge-on
// width, plus --room card widths of headroom for a lifted end card — which
// turns toward the viewer and grows — leaving --edge of air in total), and
// without outgrowing the free height between the title and the contact
// block. Capped at 520px.
const CARD_WIDTH_FORMULA =
  "min(520px, max(150px, calc((100vh - 500px) * 1.25)), calc((100vw - var(--edge, 40px)) / ((var(--count) - 1) * var(--step-x, 0.2) + 0.55 + var(--room, 0))))";

// Optical centering. A card turned by θ in perspective projects with its
// near (left) edge magnified and its far (right) edge pulled in, so the
// whole row's bounding box sits left of where it was placed by
// w² · sinθ · cosθ / (4 · PERSPECTIVE_PX) — 0px for small cards, ~15px at
// the 520px cap. CSS can't multiply two lengths, so that quadratic is
// approximated by a line through its values at 270px and 520px wide cards
// (within ~1px over that range). The whole stage — vanishing point
// included — is translated, so the perspective itself is untouched.
const CENTERING_SHIFT_FORMULA =
  "max(0px, calc(var(--card-w) * 0.0444 - 7.9px))";

// 0 (resting) … 1 (fully lifted): how far a card is raised given which card
// the pointer is on.
function getTargetLift(index: number, hoveredIndex: number | null): number {
  if (hoveredIndex === null) return 0;
  return Math.max(0, 1 - Math.abs(index - hoveredIndex) / LIFT_REACH);
}

// Where a card sits horizontally, from the center of the row.
function getOffsetX(index: number, count: number): string {
  const columnsFromCenter = index - (count - 1) / 2;
  return `calc(var(--card-w) * var(--step-x) * ${columnsFromCenter})`;
}

// A card's whole transform as a function of the --lift CSS variable (a
// number from 0 to 1) that the spring drives each frame.
function getCardTransform(index: number, count: number): string {
  const offsetX = getOffsetX(index, count);

  return `translate(-50%, -50%) translate3d(${offsetX}, calc(var(--card-w) * var(--lift) * ${LIFT_Y}), 0) rotateY(calc(${BASE_ROTATE_Y_DEG}deg - var(--lift) * ${LIFT_TURN_DEG}deg - atan2(${offsetX}, ${PERSPECTIVE_PX}px)))`;
}

// The card's resting footprint, extended upward by the lift (see the safe
// area in ProjectScreen). Same position and angle as the resting card.
function getSafeAreaTransform(index: number, count: number): string {
  const offsetX = getOffsetX(index, count);

  return `translate(-50%, -50%) translate3d(${offsetX}, calc(var(--card-w) * ${-SAFE_AREA_HEADROOM / 2}), 0) rotateY(calc(${BASE_ROTATE_Y_DEG}deg - atan2(${offsetX}, ${PERSPECTIVE_PX}px)))`;
}

type ProjectScreenProps = {
  project: Project;
  index: number;
  count: number;
  targetLift: number;
  priority: boolean;
};

// The screen itself (the link): what you see. It is also what shows the ↗
// cursor and what a click lands on, so interaction always matches the visible
// card: no dead zones on a lifted card, and no ↗ over blank space.
function ProjectScreen({
  project,
  index,
  count,
  targetLift,
  priority,
}: ProjectScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const lift = useSpring(0, LIFT_SPRING);

  useEffect(() => {
    if (shouldReduceMotion) {
      lift.jump(targetLift);
    } else {
      lift.set(targetLift);
    }
  }, [lift, shouldReduceMotion, targetLift]);

  return (
    <motion.div
      className="pointer-events-auto absolute left-1/2 top-1/2"
      style={
        {
          "--lift": lift,
          width: "var(--card-w)",
          aspectRatio: "16 / 10",
          transform: getCardTransform(index, count),
        } as MotionStyle
      }
    >
      <Link
        href="/proyectos"
        aria-label={project.title}
        {...cursorProjectProps}
        className="relative block h-full w-full overflow-hidden rounded-lg border border-neutral-300 bg-neutral-100 shadow-[0_28px_40px_-26px_rgba(0,0,0,0.5)] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-tertiary"
      >
        {project.previewImage ? (
          <Image
            src={project.previewImage}
            alt=""
            fill
            sizes="(min-width: 640px) 38vw, 52vw"
            priority={priority}
            className="object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center px-3 text-center text-xs font-medium text-neutral-500 sm:text-sm">
            {project.title}
          </span>
        )}
      </Link>
    </motion.div>
  );
}

// A card's safe area: a transparent, never-animated box covering the card's
// resting spot plus the headroom it lifts into. While the pointer is anywhere
// in it — including the strip the card just left behind — the card stays
// lifted, so it can't slide out from under the pointer, hand the hover to its
// neighbour, drop back, and flicker in a loop. It lives in its own 3D layer
// behind the screens (see ProjectStack), so it never gets in the way of the
// visible card: the ↗ cursor and the click always belong to the screen.
function SafeArea({ index, count }: { index: number; count: number }) {
  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-1/2"
      style={{
        width: "var(--card-w)",
        height: `calc(var(--card-w) * ${CARD_ASPECT + SAFE_AREA_HEADROOM})`,
        transform: getSafeAreaTransform(index, count),
      }}
    />
  );
}

type ProjectStackProps = {
  // Every project becomes a "screen"; the ones without a screenshot yet
  // show their name on a neutral background.
  projects: Project[];
};

// The web-app screens standing in a row like CDs on a rack, seen in
// perspective. Moving the pointer along them lifts each one in turn; every
// screen links to the projects page.
export function ProjectStack({ projects }: ProjectStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const releaseFrameRef = useRef<number | null>(null);

  const cancelRelease = useCallback(() => {
    if (releaseFrameRef.current === null) return;
    cancelAnimationFrame(releaseFrameRef.current);
    releaseFrameRef.current = null;
  }, []);

  const hover = useCallback(
    (index: number) => {
      cancelRelease();
      setHoveredIndex(index);
    },
    [cancelRelease]
  );

  // Releasing waits one frame: moving straight from one screen to the next
  // fires "leave" then "enter" back to back, and without this the stack
  // would drop for a frame in between.
  const release = useCallback(() => {
    cancelRelease();
    releaseFrameRef.current = requestAnimationFrame(() => {
      releaseFrameRef.current = null;
      setHoveredIndex(null);
    });
  }, [cancelRelease]);

  useEffect(() => cancelRelease, [cancelRelease]);

  const count = projects.length;
  const hoveredProject = hoveredIndex === null ? null : projects[hoveredIndex];
  const caption =
    hoveredIndex !== null && hoveredProject
      ? `${String(hoveredIndex + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")} — ${hoveredProject.title}`
      : `${count} proyectos`;

  return (
    <div className="relative my-6 min-h-[300px] flex-1">
      {/* Phones: tighter spacing so the row fits, no lift headroom (touch
          has no hover). From sm up: more air between the screens, and
          headroom so a lifted end card never leaves the screen. */}
      <div
        className="absolute inset-0 [--edge:40px] [--room:0] [--step-x:0.17] sm:[--edge:80px] sm:[--room:0.2] sm:[--step-x:0.42]"
        style={
          {
            "--count": count,
            "--card-w": CARD_WIDTH_FORMULA,
            perspective: `${PERSPECTIVE_PX}px`,
            perspectiveOrigin: "50% 45%",
            transform: `translateX(${CENTERING_SHIFT_FORMULA})`,
          } as CSSProperties
        }
      >
        {/* Behind: the safe areas. A separate <ul> is a separate 3D
            rendering context, so these never sort in front of a screen —
            whatever the depth of a lifted card, the screens paint and
            receive the pointer first. */}
        <ul
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 list-none p-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              onPointerEnter={() => hover(index)}
              onPointerLeave={release}
            >
              <SafeArea index={index} count={count} />
            </li>
          ))}
        </ul>

        {/* In front: the screens. Both lists ignore the pointer themselves
            (they cover the whole stage): only the screens and safe areas
            inside them take it. */}
        <ul
          className="pointer-events-none absolute inset-0 m-0 list-none p-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {projects.map((project, index) => (
            // preserve-3d on the <li> too: every ancestor between the
            // perspective element and a card has to keep the 3D space, or
            // the card's rotation is flattened and loses its perspective.
            // It also becomes the card's positioning box, so it covers the
            // whole stage (and lets pointer events through to the cards).
            // Moving between a screen and its safe area is "leave" then
            // "enter" for the same index, which `release` absorbs.
            <li
              key={project.id}
              className="pointer-events-none absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              onPointerEnter={() => hover(index)}
              onPointerLeave={release}
              onFocus={() => hover(index)}
              onBlur={release}
            >
              <ProjectScreen
                project={project}
                index={index}
                count={count}
                targetLift={getTargetLift(index, hoveredIndex)}
                priority={index < 3}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Caption: which screen is lifted. Plain text swap, nothing fades. */}
      <p
        aria-live="polite"
        className="pointer-events-none absolute bottom-0 left-0 text-sm text-neutral-500"
      >
        {caption}
      </p>
    </div>
  );
}
