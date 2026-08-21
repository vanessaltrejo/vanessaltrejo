"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { PhotoWindow } from "@/components/home/PhotoWindow";
import { HeroActionButtons } from "@/components/home/HeroActionButtons";

// Kept on one line for the character-by-character reveal below, so it
// has to be short enough not to overflow narrow viewports at readable
// monospace sizes — trimmed from the longer wrapped version used elsewhere.
const SUBTITLE_TEXT = "Diseño interfaces que la gente ama.";

type PhotoWindowConfig = {
  key: string;
  positionClassName: string;
};

// Scattered like desktop icons around the text — only shown from xl up,
// where there's enough side margin next to the centered hero copy.
// Each one shows a placeholder icon until a real `src` is added below.
const PHOTO_WINDOWS: PhotoWindowConfig[] = [
  { key: "tl", positionClassName: "top-[16%] left-[4%] w-44 xl:w-52" },
  { key: "tr", positionClassName: "top-[8%] right-[5%] w-48 xl:w-56" },
  { key: "bl", positionClassName: "bottom-[12%] left-[6%] w-44 xl:w-52" },
  { key: "br", positionClassName: "bottom-[18%] right-[4%] w-52 xl:w-60" },
];

export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        // The reveal-hidden starting state below is baked into the JSX
        // (not just set here) so there's no flash of the finished layout
        // before this effect runs — which means reduced-motion users need
        // an explicit push to the finished state instead of just skipping.
        gsap.set([".hero-hello", ".hero-name", ".hero-subtitle"], {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
        });
        gsap.set(
          PHOTO_WINDOWS.map((photo) => `.photo-window-${photo.key}`),
          { scale: 1 }
        );
        gsap.set(".hero-actions", { scale: 1, y: 0 });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out" },
      });

      timeline
        // "Hello" scans in left-to-right, like a terminal boot line.
        .to(".hero-hello", {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.5,
          ease: "steps(5)",
        })
        .to({}, { duration: 0.3 })
        .addLabel("collapse")
        // "Hola" is already sized as the small label — it just holds while
        // the real headline wipes in below it, no shrink needed anymore.
        .to(
          ".hero-name",
          { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.8 },
          "collapse+=0.25"
        )
        // Subtitle types itself out character by character.
        .to(".hero-subtitle", {
          clipPath: "inset(0 0% 0 0)",
          duration: 1,
          ease: `steps(${SUBTITLE_TEXT.length})`,
        })
        // Photos pop onto the desktop like scattered windows — scale/
        // transform only, no opacity fade, to match the rest of the reveal.
        // expo.out (not back.out): a fast, smoothly-decelerating zoom with
        // no overshoot/recoil at the end, like macOS opening a Quick Look
        // preview rather than a bouncy UIKit-style pop.
        .to(
          PHOTO_WINDOWS.map((photo) => `.photo-window-${photo.key}`),
          {
            scale: 1,
            duration: 0.5,
            ease: "expo.out",
            stagger: 0.1,
          },
          "+=0.1"
        )
        .to(".hero-actions", {
          scale: 1,
          duration: 0.4,
          ease: "expo.out",
        });

      // Hard on/off blink (no easing) — a cursor flickers, it doesn't fade.
      gsap.to(".hero-cursor", {
        opacity: 0,
        duration: 0.01,
        ease: "steps(1)",
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.45,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      // No background of its own — the hero sits directly on the body's
      // fixed wallpaper (the "table"), so it never moves independently
      // and never gets out of sync with it while scrolling.
      className="relative flex h-[100svh] flex-col items-center justify-start overflow-hidden px-6 pt-[22vh] text-center sm:pt-[26vh]"
      style={{ color: "#171410" }}
    >
      {PHOTO_WINDOWS.map((photo) => (
        <PhotoWindow
          key={photo.key}
          alt="Foto de Vanessa Trejo"
          className={`photo-window-${photo.key} hidden xl:block ${photo.positionClassName}`}
          style={{ transform: "scale(0)" }}
        />
      ))}

      {/* max-w-4xl (not 3xl) — "Soy Vanessa Trejo" at its largest clamp
          size needs ~800px and whitespace-nowrap means anything narrower
          than that hard-clips the trailing letters via the reveal masks'
          overflow-hidden instead of just wrapping. */}
      <div className="max-w-4xl">
        <div className="overflow-hidden">
          <p
            className="hero-hello inline-block whitespace-nowrap text-sm tracking-tight sm:text-lg"
            style={{ transformOrigin: "center", clipPath: "inset(0 100% 0 0)" }}
          >
            Hola
          </p>
        </div>
        <div className="mt-1 overflow-hidden">
          <h1
            className="hero-name whitespace-nowrap font-black leading-[0.95] tracking-tight"
            style={{
              clipPath: "inset(0 0 100% 0)",
              transform: "translateY(20px)",
              // clamp (not breakpoint steps) so "Soy Vanessa Trejo" always
              // fits on one line, down to the narrowest phone widths.
              fontSize: "clamp(2rem, 9vw, 6rem)",
              // The tight 0.95 leading pulls the line box shorter than the
              // glyphs themselves, so descenders (y, j) were getting cut
              // off by the wrapper's overflow-hidden — this em-based pad
              // (scales with the clamp'd font-size) gives them room.
              paddingBottom: "0.15em",
            }}
          >
            Soy Vanessa Trejo
          </h1>
        </div>
        <div className="mt-1 overflow-hidden">
          <p
            className="hero-subtitle inline-block whitespace-nowrap text-sm text-[#171410]/70 sm:text-lg"
            style={{ clipPath: "inset(0 100% 0 0)" }}
          >
            {SUBTITLE_TEXT}
            <span className="hero-cursor ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[#171410] align-middle" />
          </p>
        </div>
        <HeroActionButtons />
      </div>
    </section>
  );
}
