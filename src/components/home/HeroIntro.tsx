"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { TABLE_BACKGROUND } from "@/lib/home-sections";

export function HeroIntro() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const timeline = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1.1 },
      });

      timeline
        .set(".hero-reveal", { clipPath: "inset(0 0 100% 0)", y: 24 })
        .to(".hero-reveal", {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          stagger: 0.12,
        })
        .from(
          ".hero-accent",
          { scaleY: 0, transformOrigin: "top", duration: 0.9 },
          "<0.1"
        )
        .from(
          ".hero-scroll-cue",
          { y: -12, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );

      gsap.to(".hero-scroll-cue-dot", {
        y: 10,
        duration: 1.1,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative flex h-[100svh] flex-col justify-center overflow-hidden px-6 sm:px-16"
      style={{ background: TABLE_BACKGROUND, color: "#171410" }}
    >
      <div className="hero-accent absolute left-6 top-6 h-10 w-10 bg-[#171410] sm:left-16 sm:top-12" />

      <div className="max-w-3xl">
        <div className="overflow-hidden">
          <p className="hero-reveal font-mono text-xs uppercase tracking-[0.3em] text-[#171410]/60 sm:text-sm">
            Desarrolladora Full-Stack
          </p>
        </div>
        <div className="mt-4 overflow-hidden">
          <h1 className="hero-reveal text-6xl font-black leading-[0.95] tracking-tight sm:text-8xl">
            Portfolio
          </h1>
        </div>
        <div className="mt-6 overflow-hidden">
          <p className="hero-reveal max-w-md text-lg text-[#171410]/70">
            Construyo interfaces cuidadas y aprendo backend en el camino.
          </p>
        </div>
      </div>

      <div className="hero-scroll-cue absolute bottom-10 left-6 flex flex-col items-center gap-2 sm:left-16">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#171410]/50">
          Scroll
        </span>
        <span className="relative h-10 w-px bg-[#171410]/30">
          <span className="hero-scroll-cue-dot absolute -left-[3px] top-0 h-[7px] w-[7px] rounded-full bg-[#171410]" />
        </span>
      </div>
    </section>
  );
}
