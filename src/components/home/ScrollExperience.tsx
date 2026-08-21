"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HeroIntro } from "@/components/home/HeroIntro";
import { FolderSection } from "@/components/home/FolderSection";
import { DesktopMenuBar } from "@/components/home/DesktopMenuBar";
import { homeSections, TAB_STACK_TOP_OFFSET_PX } from "@/lib/home-sections";

export function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
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

        const containerBottom = containerRef.current
          ? containerRef.current.getBoundingClientRect().bottom +
            window.scrollY
          : 0;

        // Each section's own tab is a normal part of its markup (see
        // FolderSection), not a separately animated element — it moves as
        // one rigid piece with its section purely through this pin, with
        // no extra JS-driven motion of its own. pinType: "transform" (GSAP
        // simulates the pin with a CSS transform instead of position:fixed)
        // because the outro below puts a transform on containerRef, their
        // shared parent — a transform on any ancestor makes *it* the
        // containing block for position:fixed descendants, which would
        // silently break every pinned section's viewport-relative math.
        triggers = homeSections.map((_, index) => {
          const sectionEl = sectionRefs.current[index];
          if (!sectionEl) return null;

          return ScrollTrigger.create({
            trigger: sectionEl,
            // "top top" pinned tabs flush against the viewport's top edge,
            // where the fixed navbar covered them — pin lower instead, at
            // the same offset that DesktopMenuBar sits below.
            start: `top ${TAB_STACK_TOP_OFFSET_PX}`,
            end: containerBottom,
            pin: true,
            pinSpacing: false,
            pinType: "transform",
          });
        });

        // Once the last section has been reached, this extra scroll zone
        // lifts the whole stack (all four pinned sections, tabs included,
        // since they're just its children) off the screen as one rigid
        // block, revealing the table underneath. Explicit numeric bounds,
        // not "top top"/"bottom top" on the outro element — that pair
        // resolves to the *same* scroll value once the outro is exactly
        // one viewport tall, giving a zero-length (non-functional) range.
        // The window's natural max scroll is exactly `containerBottom`
        // (doc height − viewport height), so the slide must start one
        // viewport-height earlier to have any scroll room to animate over.
        if (outroRef.current) {
          triggers.push(
            ScrollTrigger.create({
              start: containerBottom - window.innerHeight,
              end: containerBottom,
              scrub: true,
              animation: gsap.fromTo(
                containerRef.current,
                { y: 0 },
                { y: "-100vh", ease: "none" }
              ),
            })
          );
        }
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

  function scrollToSectionId(sectionId: string) {
    const index = homeSections.findIndex((section) => section.id === sectionId);
    if (index === -1) return;
    scrollToSection(index);
  }

  return (
    <main>
      <DesktopMenuBar onNavigate={scrollToSectionId} />
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
      <div ref={outroRef} className="h-[100svh]" />
    </main>
  );
}
