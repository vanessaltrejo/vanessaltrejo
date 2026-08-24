"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { DOCK_HEIGHT_PX } from "@/lib/home-sections";
import { useLanguage } from "@/lib/language-context";

// The site's default body font is Times New Roman (see globals.css) — the
// dock keeps the original OS system font instead, matching a real macOS
// dock's own tooltip typography rather than the page content behind it.
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const MAIL_URL = "mailto:vanessalt08@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/vanessaltrejo/";
const GITHUB_URL = "https://github.com/vanessaltrejo";
const YOUTUBE_URL = "https://www.youtube.com/@vanessaltrejo";
const CV_URL = "/Vanessa_Trejo_CV.pdf";

// Proximity-based icon "magnification," like the real macOS dock: every
// icon within this many px of the cursor (measured center-to-cursor along
// x) grows smoothly, peaking at MAGNIFY_SCALE for the icon right under the
// cursor and lifting up to MAGNIFY_LIFT_PX above the dock's baseline.
const MAGNIFY_RADIUS_PX = 90;
const MAGNIFY_SCALE = 1.4;
const MAGNIFY_LIFT_PX = 14;

// Only the single icon the cursor is influencing the *most* shows its name
// — like the real dock highlighting one icon at a time — not every icon
// that's even slightly magnified by proximity. 0-1, same scale as the
// eased proximity value below.
const TOOLTIP_EASED_THRESHOLD = 0.6;

// Real app-icon artwork provided by Vanessa (public/icons/*.png) — each
// image already has its own rounded-square background baked in, so this
// just clips it to match the other tiles' corner radius, no gradient
// wrapper needed like the hand-drawn glyphs below.
function DockImageIcon({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[22%] shadow-md sm:h-12 sm:w-12">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}

// The name-on-hover bubble every dock item shows above itself — same dark
// frosted-glass language as the language dropdown/FAQ panel elsewhere on
// the site. Visibility isn't plain CSS :hover — see the magnification
// effect below, which shows this for whichever icon is currently the
// nearest/most-magnified one (like the real macOS dock), not only once
// the cursor is exactly on top of it. Keyboard focus still shows it via
// the focus/blur listeners set up alongside that same effect.
function DockTooltip({ label }: { label: string }) {
  return (
    <span
      data-dock-tooltip
      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#2b2b2e]/95 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150"
    >
      {label}
    </span>
  );
}

function DockButton({
  label,
  onClick,
  href,
  download,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  // Triggers a file download instead of opening href in a new tab — no
  // target="_blank" here, since combining that with `download` can still
  // briefly flash an extra tab open in some browsers.
  download?: boolean;
  children: ReactNode;
}) {
  // relative + origin-bottom: the mousemove-driven scale/lift below (see
  // AppleDock's magnification effect) grows each icon from its base
  // instead of its center, and the tooltip above positions off this same
  // box. data-dock-item is how that effect finds every icon to measure
  // cursor proximity against, without needing a ref passed down through
  // every call site.
  const className = "group relative flex origin-bottom flex-col items-center";

  if (href) {
    return (
      <a
        href={href}
        {...(download
          ? { download: true }
          : { target: "_blank", rel: "noopener noreferrer" })}
        aria-label={label}
        data-dock-item
        className={className}
      >
        <DockTooltip label={label} />
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-dock-item
      className={className}
    >
      <DockTooltip label={label} />
      {children}
    </button>
  );
}

// A little vertical "quick look" thumbnail of the CV itself — like a real
// macOS dock, where a document in the dock reads as a tiny preview of the
// actual page (portrait, a few text-line bars) instead of a generic
// square app-icon tile. Deliberately skips the rounded-square
// background/shadow every *app* icon here uses, so it reads as a document
// sitting in the dock, not a button.
function CvPreview() {
  return (
    <span className="flex h-11 w-11 items-end justify-center pb-0.5 sm:h-12 sm:w-12">
      <span className="flex h-10 w-7 flex-col gap-1 rounded-[3px] border border-black/10 bg-white p-1.5 shadow-lg sm:h-11 sm:w-[1.85rem]">
        <span className="h-1 w-full shrink-0 rounded-full bg-[#171410]/70" />
        <span className="h-0.5 w-4/5 shrink-0 rounded-full bg-[#171410]/30" />
        <span className="h-0.5 w-full shrink-0 rounded-full bg-[#171410]/20" />
        <span className="h-0.5 w-3/5 shrink-0 rounded-full bg-[#171410]/20" />
        <span className="mt-auto h-0.5 w-full shrink-0 rounded-full bg-[#171410]/15" />
        <span className="h-0.5 w-2/3 shrink-0 rounded-full bg-[#171410]/15" />
      </span>
    </span>
  );
}

function DockDivider() {
  return <div className="mx-1 h-9 w-px self-center bg-white/40 sm:h-10" />;
}

export function AppleDock() {
  const { t } = useLanguage();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const items = Array.from(
      nav.querySelectorAll<HTMLElement>("[data-dock-item]")
    );
    const tooltips = items.map((item) =>
      item.querySelector<HTMLElement>("[data-dock-tooltip]")
    );

    function showTooltip(indexToShow: number) {
      tooltips.forEach((tooltip, index) => {
        if (tooltip) tooltip.style.opacity = index === indexToShow ? "1" : "0";
      });
    }

    function hideAllTooltips() {
      tooltips.forEach((tooltip) => {
        if (tooltip) tooltip.style.opacity = "0";
      });
    }

    // Keyboard focus shows the focused icon's name regardless of the
    // cursor — this is plain accessibility, not a motion effect, so it
    // isn't gated behind the prefers-reduced-motion check below.
    function handleFocusIn(event: FocusEvent) {
      const index = items.indexOf(event.target as HTMLElement);
      if (index !== -1) showTooltip(index);
    }

    nav.addEventListener("focusin", handleFocusIn);
    nav.addEventListener("focusout", hideAllTooltips);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // No proximity magnification — fall back to a plain per-icon hover
      // so names are still reachable without the motion-driven effect.
      const handleItemEnter = items.map(
        (_, index) => () => showTooltip(index)
      );
      items.forEach((item, index) => {
        item.addEventListener("mouseenter", handleItemEnter[index]);
        item.addEventListener("mouseleave", hideAllTooltips);
      });
      return () => {
        nav.removeEventListener("focusin", handleFocusIn);
        nav.removeEventListener("focusout", hideAllTooltips);
        items.forEach((item, index) => {
          item.removeEventListener("mouseenter", handleItemEnter[index]);
          item.removeEventListener("mouseleave", hideAllTooltips);
        });
      };
    }

    const setScale = items.map((item) =>
      gsap.quickTo(item, "scale", { duration: 0.25, ease: "power3.out" })
    );
    const setLift = items.map((item) =>
      gsap.quickTo(item, "y", { duration: 0.25, ease: "power3.out" })
    );

    function handleMouseMove(event: MouseEvent) {
      let peakIndex = -1;
      let peakEased = 0;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const distance = Math.abs(event.clientX - (rect.left + rect.width / 2));
        const proximity = Math.max(0, 1 - distance / MAGNIFY_RADIUS_PX);
        // Smoothstep, not linear — a gentler falloff near the edge of the
        // magnification radius instead of a hard-edged cutoff.
        const eased = proximity * proximity * (3 - 2 * proximity);
        setScale[index](1 + (MAGNIFY_SCALE - 1) * eased);
        setLift[index](-MAGNIFY_LIFT_PX * eased);

        if (eased > peakEased) {
          peakEased = eased;
          peakIndex = index;
        }
      });

      // Only the icon closest to the cursor shows its name, and only once
      // it's clearly the nearest one — not every icon nudged by proximity.
      if (peakEased >= TOOLTIP_EASED_THRESHOLD) {
        showTooltip(peakIndex);
      } else {
        hideAllTooltips();
      }
    }

    function handleMouseLeave() {
      setScale.forEach((set) => set(1));
      setLift.forEach((set) => set(0));
      hideAllTooltips();
    }

    nav.addEventListener("mousemove", handleMouseMove);
    nav.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      nav.removeEventListener("focusin", handleFocusIn);
      nav.removeEventListener("focusout", hideAllTooltips);
      nav.removeEventListener("mousemove", handleMouseMove);
      nav.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      // Always on top, like a real desktop dock — visible over the hero
      // and over the folder stack alike, not just in the strip the outro
      // reveals at the end.
      className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center pb-3"
      style={{ height: DOCK_HEIGHT_PX, fontFamily: SYSTEM_FONT_STACK }}
    >
      <nav
        ref={navRef}
        // origin-bottom + a barely-there scale-down: shrinks the whole dock
        // as one piece (icons, gaps, padding all together) from its bottom
        // edge, instead of resizing any individual piece of it.
        className="flex origin-bottom items-end gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 shadow-2xl backdrop-blur-xl sm:gap-3 sm:px-4"
        style={{ transform: "scale(0.9)" }}
      >
        <DockButton label={t.dock.mail} href={MAIL_URL}>
          {/* Next flags this as the page's Largest Contentful Paint
              element (it's part of the always-visible fixed dock, so it
              paints on first load same as the hero text) — priority skips
              lazy-loading and preloads it instead of warning about it. */}
          <DockImageIcon src="/icons/mail.png" alt={t.dock.mail} priority />
        </DockButton>
        <DockButton label="LinkedIn" href={LINKEDIN_URL}>
          <DockImageIcon src="/icons/linkedin.png" alt="LinkedIn" />
        </DockButton>
        <DockButton label="GitHub" href={GITHUB_URL}>
          <DockImageIcon src="/icons/github.png" alt="GitHub" />
        </DockButton>
        <DockButton label="YouTube" href={YOUTUBE_URL}>
          <DockImageIcon src="/icons/youtube.png" alt="YouTube" />
        </DockButton>

        <DockDivider />

        <DockButton label={t.dock.downloadsCv} href={CV_URL} download>
          <CvPreview />
        </DockButton>
      </nav>
    </div>
  );
}
