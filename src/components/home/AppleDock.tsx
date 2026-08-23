"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { DOCK_HEIGHT_PX } from "@/lib/home-sections";
import { LANGUAGE_LOCALE } from "@/lib/translations";
import { useLanguage } from "@/lib/language-context";

// Dummy destinations until the real profile URLs / CV file are provided.
const MAIL_URL = "#";
const WHATSAPP_URL = "#";
const LINKEDIN_URL = "#";
const INSTAGRAM_URL = "#";
const CALENDAR_URL = "#";
const GITHUB_URL = "#";

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

type StackItem = {
  label: string;
  href: string;
};

const CV_HREF = "#";

type AppleDockProps = {
  onFinderClick: () => void;
  onNotesClick: () => void;
};

function DockTile({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-[22%] shadow-md sm:h-12 sm:w-12 ${className}`}
    >
      {children}
    </span>
  );
}

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
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
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
        target="_blank"
        rel="noopener noreferrer"
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

// The folder-with-a-download-arrow badge macOS uses for its Downloads
// stack — distinct from a plain folder so it reads as "open to see files"
// rather than a section shortcut.
function DownloadsFolderGlyph() {
  return (
    <svg viewBox="0 0 44 44" className="h-full w-full" aria-hidden="true">
      <path
        d="M4,12 a3,3 0 0 1 3,-3 h9 l3,4 h18 a3,3 0 0 1 3,3 v19 a3,3 0 0 1 -3,3 h-30 a3,3 0 0 1 -3,-3 Z"
        fill="#6cb2f2"
      />
      <path
        d="M4,15 h36 v16 a3,3 0 0 1 -3,3 h-30 a3,3 0 0 1 -3,-3 Z"
        fill="#3f8ee0"
      />
      <circle cx="22" cy="24" r="8.5" fill="white" fillOpacity="0.95" />
      <path
        d="M22,20 v7 m0,0 l-3.2,-3.2 M22,27 l3.2,-3.2"
        fill="none"
        stroke="#3f8ee0"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A single fanned-out document preview — a paper card with a folded
// corner, standing in for macOS's stack-expand grid until there's more
// than one file to actually fan out.
function DocumentPreviewCard({ item }: { item: StackItem }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-24 flex-col items-center gap-1.5 transition-transform hover:-translate-y-1 sm:w-28"
    >
      <span className="relative flex aspect-[3/4] w-full items-center justify-center rounded-md bg-white shadow-xl">
        <span className="absolute right-0 top-0 h-3 w-3 rounded-bl-md bg-[#d8d8d8]" />
        <span className="rounded bg-[#e0442f] px-1.5 py-0.5 text-[9px] font-bold text-white">
          PDF
        </span>
      </span>
      <span
        className="line-clamp-2 text-center text-[11px] font-medium text-white"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
      >
        {item.label}
      </span>
    </a>
  );
}

function DockDivider() {
  return <div className="mx-1 h-9 w-px self-center bg-white/40 sm:h-10" />;
}

function CalendarGlyph({ locale }: { locale: string }) {
  const day = new Date().getDate();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[22%]">
      <div
        className="flex h-[30%] items-center justify-center bg-[#e0442f] text-[9px] font-semibold uppercase tracking-wide text-white sm:text-[10px]"
        suppressHydrationWarning
      >
        {new Date().toLocaleDateString(locale, { month: "short" }).replace(".", "")}
      </div>
      <div
        className="flex flex-1 items-center justify-center bg-white text-base font-semibold text-[#171410] sm:text-lg"
        suppressHydrationWarning
      >
        {day}
      </div>
    </div>
  );
}

export function AppleDock({ onFinderClick, onNotesClick }: AppleDockProps) {
  const { t, language } = useLanguage();
  const [isStackOpen, setStackOpen] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const cvStackItems: StackItem[] = [{ label: t.dock.cvFileLabel, href: CV_HREF }];

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

  useEffect(() => {
    if (!isStackOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!stackRef.current?.contains(event.target as Node)) {
        setStackOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isStackOpen]);

  return (
    <div
      // Always on top, like a real desktop dock — visible over the hero
      // and over the folder stack alike, not just in the strip the outro
      // reveals at the end.
      className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center pb-4"
      style={{ height: DOCK_HEIGHT_PX }}
    >
      <nav
        ref={navRef}
        className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 shadow-2xl backdrop-blur-xl sm:gap-3 sm:px-4"
      >
        <DockButton label={t.dock.finder} onClick={onFinderClick}>
          {/* Next flags this as the page's Largest Contentful Paint
              element (it's part of the always-visible fixed dock, so it
              paints on first load same as the hero text) — priority skips
              lazy-loading and preloads it instead of warning about it. */}
          <DockImageIcon src="/icons/finder.png" alt={t.dock.finder} priority />
        </DockButton>
        <DockButton label={t.dock.mail} href={MAIL_URL}>
          <DockImageIcon src="/icons/mail.png" alt={t.dock.mail} />
        </DockButton>
        <DockButton label="WhatsApp" href={WHATSAPP_URL}>
          <DockImageIcon src="/icons/whatsapp.png" alt="WhatsApp" />
        </DockButton>
        <DockButton label="LinkedIn" href={LINKEDIN_URL}>
          <DockImageIcon src="/icons/linkedin.png" alt="LinkedIn" />
        </DockButton>
        <DockButton label="Instagram" href={INSTAGRAM_URL}>
          <DockImageIcon src="/icons/instagram.png" alt="Instagram" />
        </DockButton>
        <DockButton label={t.dock.calendar} href={CALENDAR_URL}>
          <DockTile className="overflow-hidden p-0">
            <CalendarGlyph locale={LANGUAGE_LOCALE[language]} />
          </DockTile>
        </DockButton>
        <DockButton label="GitHub" href={GITHUB_URL}>
          <DockImageIcon src="/icons/github.png" alt="GitHub" />
        </DockButton>
        <DockButton label={t.dock.notes} onClick={onNotesClick}>
          <DockImageIcon src="/icons/notes.png" alt={t.dock.notes} />
        </DockButton>

        <DockDivider />

        <div ref={stackRef} className="relative">
          {/* Fanned-out previews, popping up above the dock — same
              scale/transform reveal language as the rest of the site,
              toggled open/closed rather than played once. */}
          <div
            aria-hidden={!isStackOpen}
            inert={!isStackOpen}
            className="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2 gap-3 transition-transform duration-300"
            style={{
              transform: `translate(-50%, 0) scale(${isStackOpen ? 1 : 0})`,
              transformOrigin: "bottom center",
            }}
          >
            {cvStackItems.map((item) => (
              <DocumentPreviewCard key={item.label} item={item} />
            ))}
          </div>
          <DockButton
            label={t.dock.downloadsCv}
            onClick={() => setStackOpen((open) => !open)}
          >
            <DockTile className="overflow-hidden">
              <DownloadsFolderGlyph />
            </DockTile>
          </DockButton>
        </div>
      </nav>
    </div>
  );
}
