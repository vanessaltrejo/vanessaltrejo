"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HeroIntro } from "@/components/home/HeroIntro";
import { FolderSection } from "@/components/home/FolderSection";
import {
  TAB_HEIGHT_PX,
  TABLE_BACKGROUND,
  homeSections,
} from "@/lib/home-sections";

export function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionScrollTargets = useRef<number[]>([]);
  const normalizerRef = useRef<ReturnType<
    typeof ScrollTrigger.normalizeScroll
  > | null>(null);
  // Each section's tab is portaled here instead of rendered inside the
  // (position: fixed) section itself — a fixed/z-indexed section creates
  // its own stacking context, so a high z-index on a nested tab only wins
  // against its own siblings, not tabs belonging to other sections.
  const [tabsLayer, setTabsLayer] = useState<HTMLDivElement | null>(null);
  // 0 (hidden) to 1 (fully in place) per tab, driven continuously by scroll
  // position so each tab slides up into the row with the same section it
  // belongs to, instead of popping in once a threshold is crossed.
  const [tabProgress, setTabProgress] = useState<number[]>(() =>
    homeSections.map(() => 0)
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // The browser restores the previous scroll offset on reload, which
      // can briefly show pinned sections/tabs mid-experience before the
      // page settles. This experience always starts at the top instead.
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

        if (prefersReducedMotion) {
          setTabProgress(homeSections.map(() => 1));
          return;
        }

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

        // Tabs are portaled into a layer that's always mounted at the top,
        // so — unlike when a tab lived inside its own (fixed) section —
        // nothing about the pin state hides it before its section is
        // reached. Drive each tab's reveal continuously from raw scroll
        // position (not a threshold toggle) so it slides up in the same
        // motion as its section arriving, and slides back out — both
        // ways, no ratchet — as you scroll back above that section.
        const tracker = ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const y = self.scroll();
            setTabProgress(
              sectionScrollTargets.current.map((target) => {
                const progress = (y - (target - TAB_HEIGHT_PX)) / TAB_HEIGHT_PX;
                return Math.min(1, Math.max(0, progress));
              })
            );
          },
        });
        triggers.push(tracker);
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
      <div
        ref={setTabsLayer}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 overflow-hidden"
        style={{ height: TAB_HEIGHT_PX, background: TABLE_BACKGROUND }}
      />
      <div ref={containerRef}>
        {homeSections.map((section, index) => (
          <FolderSection
            key={section.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            section={section}
            index={index}
            tabProgress={tabProgress[index] ?? 0}
            tabsLayer={tabsLayer}
            onTabClick={scrollToSection}
          />
        ))}
      </div>
    </main>
  );
}
