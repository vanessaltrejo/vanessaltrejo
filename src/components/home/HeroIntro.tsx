"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/lib/language-context";

export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  // Read once for the intro timeline below — the reveal plays once on
  // mount and isn't replayed on a later language switch (see the
  // no-dependency useGSAP call), so this only needs whatever the language
  // was at that moment. The JSX further down stays reactive to language
  // changes independently of this animation.
  const { t } = useLanguage();

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
        gsap.set(".hero-cursor", { opacity: 0 });
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
          ease: `steps(${t.hero.subtitle.length})`,
        })
        // Cursor blinks a few times after the typing finishes, like a
        // terminal waiting for input — then fades out for good instead of
        // blinking forever, since there's nothing left being "typed".
        .to(".hero-cursor", {
          opacity: 0,
          duration: 0.01,
          ease: "steps(1)",
          repeat: 5,
          yoyo: true,
          repeatDelay: 0.45,
        })
        .to(".hero-cursor", { opacity: 0, duration: 0.3 });
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
            {t.hero.hello}
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
              fontSize: "clamp(1.5rem, 7vw, 4.5rem)",
              // The tight 0.95 leading pulls the line box shorter than the
              // glyphs themselves, so descenders (y, j) were getting cut
              // off by the wrapper's overflow-hidden — this em-based pad
              // (scales with the clamp'd font-size) gives them room.
              paddingBottom: "0.15em",
            }}
          >
            {t.hero.name}
          </h1>
        </div>
        <div className="mt-1 overflow-hidden">
          <p
            className="hero-subtitle inline-block whitespace-nowrap text-[#171410]/70"
            style={{
              clipPath: "inset(0 100% 0 0)",
              // Fluid, not fixed text-sm/lg: this line is noticeably
              // longer than the original subtitle, so it needs to shrink
              // further on narrow phones to still fit on one line without
              // the reveal mask's overflow-hidden clipping the tail end.
              fontSize: "clamp(0.7rem, 2.1vw, 1.125rem)",
            }}
          >
            {t.hero.subtitle}
            <span className="hero-cursor ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[#171410] align-middle" />
          </p>
        </div>
      </div>
    </section>
  );
}
