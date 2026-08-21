"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HeroIntro } from "@/components/home/HeroIntro";
import { FolderSection } from "@/components/home/FolderSection";
import { homeSections } from "@/lib/home-sections";

export function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionScrollTargets = useRef<number[]>([]);
  const normalizerRef = useRef<ReturnType<
    typeof ScrollTrigger.normalizeScroll
  > | null>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // The browser restores the previous scroll offset on reload, which
      // can briefly show pinned sections mid-experience before the page
      // settles. This experience always starts at the top instead.
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);

      // On an abrupt/fast scroll (trackpad flick, fast wheel), the browser
      // can jump several pixels between scroll events, so a pinned section
      // briefly renders in its normal (unpinned) flow position for a frame
      // before GSAP catches up. normalizeScroll keeps ScrollTrigger's
      // tracked position in sync with real scroll input to prevent that.
      // momentum is capped at 1 (no added "fling" on top of the trackpad's
      // own momentum) so it still feels 1:1 with the input, not floaty.
      normalizerRef.current = ScrollTrigger.normalizeScroll({
        momentum: () => 1,
      });

      let triggers: (ScrollTrigger | null)[] = [];
      let cancelled = false;

      function measureAndCreateTriggers() {
        if (cancelled) return;

        sectionScrollTargets.current = homeSections.map((_, index) => {
          const sectionEl = sectionRefs.current[index];
          if (!sectionEl) return 0;
          return sectionEl.getBoundingClientRect().top + window.scrollY;
        });

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        if (prefersReducedMotion) return;

        // Each section's own tab is a normal part of its markup (see
        // FolderSection), not a separately animated element — it moves as
        // one rigid piece with its section purely through this pin, with
        // no extra JS-driven motion of its own.
        triggers = homeSections.map((_, index) => {
          const sectionEl = sectionRefs.current[index];
          if (!sectionEl) return null;

          return ScrollTrigger.create({
            trigger: sectionEl,
            start: "top top",
            endTrigger: containerRef.current,
            end: "bottom bottom",
            pin: true,
            pinSpacing: false,
          });
        });
      }

      // Fonts finishing loading after mount can reflow the page; measuring
      // before that leaves GSAP's pinned width stale, causing a visible
      // re-snap the first time ScrollTrigger auto-refreshes.
      if (document.fonts?.ready) {
        document.fonts.ready.then(measureAndCreateTriggers);
      } else {
        measureAndCreateTriggers();
      }

      return () => {
        cancelled = true;
        triggers.forEach((trigger) => trigger?.kill());
      };
    },
    { scope: containerRef }
  );

  function scrollToSection(index: number) {
    const target = sectionScrollTargets.current[index];
    if (target === undefined) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // normalizeScroll keeps its own internal scroll proxy; calling native
    // window.scrollTo while it's active doesn't reliably stick, so route
    // programmatic scrolls through the normalizer instance instead.
    if (normalizerRef.current) {
      if (prefersReducedMotion) {
        normalizerRef.current.scrollY(target);
      } else {
        gsap.to(normalizerRef.current, {
          scrollY: target,
          duration: 1,
          ease: "power2.inOut",
        });
      }
    } else {
      window.scrollTo({
        top: target,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  }

  return (
    <main>
      <HeroIntro />
      <div ref={containerRef}>
        {homeSections.map((section, index) => (
          <FolderSection
            key={section.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            section={section}
            index={index}
            onTabClick={scrollToSection}
          />
        ))}
      </div>
    </main>
  );
}
