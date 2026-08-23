"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { HeroIntro } from "@/components/home/HeroIntro";
import { FolderSection } from "@/components/home/FolderSection";
import { DesktopMenuBar } from "@/components/home/DesktopMenuBar";
import { AppleDock } from "@/components/home/AppleDock";
import { NotesContactCard } from "@/components/home/NotesContactCard";
import { FaqWindow } from "@/components/home/FaqWindow";
import {
  homeSections,
  TAB_STACK_TOP_OFFSET_PX,
  DOCK_HEIGHT_PX,
} from "@/lib/home-sections";
import { LanguageProvider, useLanguage } from "@/lib/language-context";

// Thin wrapper so useLanguage() (needed by every child below) has a
// provider to read from — the actual experience lives in the inner
// component, which is the only part that needs re-rendering on language
// change.
export function ScrollExperience() {
  return (
    <LanguageProvider>
      <ScrollExperienceInner />
    </LanguageProvider>
  );
}

function ScrollExperienceInner() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const sectionScrollTargets = useRef<number[]>([]);
  // The live pin trigger for each section, kept alongside the plain-number
  // snapshot above. ScrollTrigger re-resolves a string `start` (e.g.
  // "top 56") against the current DOM on every refresh — including the
  // auto-refresh it fires on window "load", after images finish decoding —
  // but the snapshot in sectionScrollTargets is only ever measured once, at
  // mount. If anything reflows the page after that single measurement, a
  // tab-click tween aims for the stale pixel while the pin itself engages
  // at ScrollTrigger's corrected one, causing a one-frame snap right as the
  // scroll settles. Reading trigger.start at click time keeps the tween's
  // destination and the pin's own engage point in perfect agreement.
  const sectionTriggersRef = useRef<(ScrollTrigger | null)[]>([]);
  const notesScrollTarget = useRef(0);
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
        // The document's absolute max scroll, and also exactly where the
        // outro animation's `end` lands — i.e. the scroll position at
        // which the folder stack has fully cleared and NotesContactCard
        // is completely revealed underneath.
        notesScrollTarget.current = containerBottom;

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
        sectionTriggersRef.current = triggers;

        // Once the last section has been reached, this extra scroll zone
        // lifts the whole stack (all four pinned sections, tabs included,
        // since they're just its children) off the screen as one rigid
        // block, revealing the table underneath. AppleDock doesn't need
        // any room reserved for it here — it's fixed and always on top
        // regardless of what's scrolled beneath it. Explicit numeric
        // bounds, not "top top"/"bottom top" on the outro element — that
        // pair resolves to the *same* scroll value once the outro is
        // exactly one viewport tall, giving a zero-length (non-functional)
        // range. The window's natural max scroll is exactly
        // `containerBottom` (doc height − viewport height), so the slide
        // must start one viewport-height earlier to have scroll room.
        //
        // The lift distance is one viewport height PLUS
        // TAB_STACK_TOP_OFFSET_PX, not just one viewport height: each
        // section pins with its top at that offset (not at the very top
        // of the viewport, so the fixed navbar doesn't cover it), so its
        // bottom edge rests that same distance past the viewport's own
        // bottom. A plain -100vh lift only cancels the viewport-height
        // part, leaving that offset's worth of the last section's bottom
        // edge stuck on screen.
        if (outroRef.current) {
          triggers.push(
            ScrollTrigger.create({
              start: containerBottom - window.innerHeight,
              end: containerBottom,
              scrub: true,
              animation: gsap.fromTo(
                containerRef.current,
                { y: 0 },
                {
                  y: -(window.innerHeight + TAB_STACK_TOP_OFFSET_PX),
                  ease: "none",
                }
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
        // normalizeScroll installs its own scroll listeners/rAF ticker
        // outside of useGSAP's own automatic revert, so it needs its own
        // explicit teardown here too.
        normalizerRef.current?.kill();
      };
    },
    { scope: containerRef }
  );

  function scrollToTarget(target: number) {
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

  function scrollToSection(index: number) {
    // Prefer the live trigger's own resolved start over the once-measured
    // snapshot — see the comment on sectionTriggersRef above.
    const liveTrigger = sectionTriggersRef.current[index];
    const target = liveTrigger ? liveTrigger.start : sectionScrollTargets.current[index];
    if (target === undefined) return;
    scrollToTarget(target);
  }

  function scrollToTop() {
    scrollToTarget(0);
  }

  // Notas and the FAQ window sit side by side in the same revealed area,
  // so both dock icons scroll to the same spot.
  function scrollToDesktopWindows() {
    scrollToTarget(notesScrollTarget.current);
  }

  return (
    <main>
      <DesktopMenuBar onLogoClick={scrollToTop} />
      <AppleDock
        onFinderClick={scrollToTop}
        onNotesClick={scrollToDesktopWindows}
      />
      <HeroIntro />
      <div ref={containerRef}>
        {homeSections.map((section, index) => (
          <FolderSection
            key={section.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            section={{ ...section, ...t.sections[section.id] }}
            index={index}
            onTabClick={scrollToSection}
          />
        ))}
      </div>
      {/* The "table", fully cleared — two separate app windows sitting
          side by side on it, same as two apps open on a real desktop.
          Top-aligned (not vertically centered) with generous top padding,
          not just AppleDock's own fixed height padded at the bottom, so
          there's real breathing room between the folder stack sliding
          away above and the windows starting below. */}
      <div
        ref={outroRef}
        className="flex h-[100svh] flex-col items-center justify-start px-6 pt-20 sm:px-10 sm:pt-24"
        style={{ paddingBottom: DOCK_HEIGHT_PX + 24 }}
      >
        <div className="flex w-full max-w-7xl flex-col gap-6 lg:h-[67vh] lg:flex-row">
          <div className="h-[53vh] min-h-0 flex-[1.6] lg:h-full">
            <NotesContactCard />
          </div>
          <div className="h-[53vh] min-h-0 flex-1 lg:h-full">
            <FaqWindow />
          </div>
        </div>
      </div>
    </main>
  );
}
