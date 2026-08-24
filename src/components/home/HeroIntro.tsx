"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { useLanguage } from "@/lib/language-context";
import { FOLDER_INSET_VAR_CLASS } from "@/lib/home-sections";
import { TypingAnimation } from "@/registry/magicui/typing-animation";

// "Times New Roman" is a system font already present everywhere — no
// next/font loading needed for it, unlike the display face below.
const TIMES_NEW_ROMAN = "'Times New Roman', Times, serif";

type HeroIntroProps = {
  // ScrollExperience drives every bit of this element's motion directly,
  // through its own dedicated scrubbed timeline (see the heroTimeline
  // comment there) — not just at the very end, but for the entire scroll
  // experience from Hero onward.
  imageRef: RefObject<HTMLDivElement | null>;
};

export function HeroIntro({ imageRef }: HeroIntroProps) {
  const { t } = useLanguage();

  return (
    <section
      // No background of its own — the hero sits directly on the body's
      // fixed wallpaper (the "table"), so it never moves independently
      // and never gets out of sync with it while scrolling.
      // Left inset tracks Proyectos folder's own content edge at base/sm
      // (--folder-inset plus that folder's px-4/sm:px-8 card padding), so
      // "Vanessa Trejo" lines up with "Proyectos" below it. Fixed at 120px
      // on desktop (lg) instead of continuing to grow with --folder-inset
      // there — it would otherwise keep sliding right past 1280px wide
      // viewports, same as the folders do, which read as too far right.
      // Right side keeps its own independent padding — nothing below
      // Hero needs to align with it.
      className={`relative flex h-[100svh] items-center pl-[calc(var(--folder-inset)+0.75rem)] pr-6 sm:pl-[calc(var(--folder-inset)+1.75rem)] sm:pr-12 lg:pl-[120px] lg:pr-20 ${FOLDER_INSET_VAR_CLASS}`}
    >
      <div className="relative z-10 max-w-2xl text-left" style={{ color: "#ffffff" }}>
        {/* Shifted up via transform (not margin) so it doesn't drag the
            email below along with it — a transform moves this block purely
            visually, leaving its normal-flow box (and everything after it)
            exactly where it already was. */}
        <div style={{ transform: "translateY(-40px)" }}>
          {/* The four lines type themselves out in sequence — each one's
              `delay` is hand-timed to start right as the previous line
              would finish typing at its own length and speed, so they read
              as one continuous typed intro instead of firing all at once.
              leading-normal/tracking-normal on the plain <p> lines
              counteracts TypingAnimation's own default line-height/tracking
              (meant for a display heading), which would otherwise loosen
              their normal paragraph spacing. */}
          <TypingAnimation
            as="p"
            duration={45}
            className="leading-normal tracking-normal text-xl sm:text-2xl"
            style={{ fontFamily: TIMES_NEW_ROMAN }}
          >
            {t.hero.hello}
          </TypingAnimation>
          <TypingAnimation
            as="h1"
            duration={45}
            delay={600}
            className="mt-1 whitespace-nowrap leading-[0.95]"
            style={{
              fontFamily: "var(--font-instrument-serif)",
              // clamp keeps "Vanessa Trejo" the dominant element on the page
              // without ever forcing it onto two lines, down to narrow
              // phones — paired with whitespace-nowrap so it can't wrap even
              // mid-word at in-between widths.
              fontSize: "clamp(3.5rem, 10vw, 9rem)",
              // Matches the form's Continuar/Enviar button color
              // (NotesContactCard), tying the hero's name to the same
              // accent used for the site's primary action.
              color: "#F8DE67",
              // Negative, not positive: Instrument Serif's default spacing
              // already reads a little loose at this size, and the tighter
              // kerning is what makes "Vanessa Trejo" read as one word-mark
              // instead of two spaced-out words.
              letterSpacing: "-0.02em",
            }}
          >
            {t.hero.name}
          </TypingAnimation>
          <TypingAnimation
            as="p"
            duration={45}
            delay={1400}
            className="leading-normal tracking-normal mt-4 text-2xl sm:text-3xl"
            style={{ fontFamily: TIMES_NEW_ROMAN }}
          >
            {t.hero.subtitle}
          </TypingAnimation>
        </div>
        <TypingAnimation
          as="p"
          duration={45}
          delay={3200}
          className="leading-normal tracking-normal mt-8 text-base text-white/60 sm:text-lg"
          style={{ fontFamily: TIMES_NEW_ROMAN }}
        >
          {t.hero.email}
        </TypingAnimation>
      </div>

      {/* Fixed (viewport-relative), not absolute-within-Hero — its actual
          movement is entirely driven by ScrollExperience's own scrubbed
          timeline (via imageRef), in three phases: it tracks scroll 1:1
          while Hero gives way to the first folder (reading as a normal
          scroll-along element), then holds still — visually "standing"
          behind the folder stack, knees peeking past its edge — for
          however long the user scrolls through the rest of the folders,
          and finally lifts off-screen together with the whole stack at
          the very end. Being fixed (rather than an absolute-within-Hero
          child) is what lets that JS timeline drive 100% of its motion
          without fighting normal document scroll.

          Hidden below lg — at phone/tablet widths there isn't room for a
          portrait illustration next to a readable text block, and the
          text is what actually carries the page. bottom is negative (not
          0) so her lower legs land past the viewport edge — no z-index
          of its own (stays below the Proyectos folder's explicit
          z-10+), so that folder renders *in front of* and clips her
          knees-down, like she's standing behind it, instead of her legs
          floating on top of the folder's own background. */}
      <div
        ref={imageRef}
        className="pointer-events-none fixed right-0 hidden lg:block"
        style={{ bottom: "-11rem", height: "109vh", aspectRatio: "1080 / 1350" }}
      >
        <Image
          src="/vanessaanimated.png"
          alt=""
          fill
          sizes="45vw"
          className="object-contain object-bottom"
          priority
        />
      </div>
    </section>
  );
}
