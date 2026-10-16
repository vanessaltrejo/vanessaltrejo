"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import type { Hackathon } from "@/lib/experience/types";

// The floating preview: a miniature browser window (a bar with three dots and
// a 16:9 screen) that follows the pointer while it is over a hackathon.
const SCREEN_WIDTH = 288;
const SCREEN_HEIGHT = (SCREEN_WIDTH * 9) / 16;
const BAR_HEIGHT = 20;
const WINDOW_BORDER = 1;
const PREVIEW_WIDTH = SCREEN_WIDTH + WINDOW_BORDER * 2;
const PREVIEW_HEIGHT = BAR_HEIGHT + SCREEN_HEIGHT + WINDOW_BORDER * 2;
// How far from the pointer it floats, and how close to the window's edges it
// may get before flipping to the pointer's other side.
const POINTER_OFFSET = 24;
const EDGE_MARGIN = 16;

type HackathonsListProps = {
  hackathons: Hackathon[];
};

function HackathonRowContent({ hackathon }: { hackathon: Hackathon }) {
  return (
    <>
      <div>
        <h3 className="text-xl text-secondary transition-colors group-hover/hackathon:text-tertiary">
          {hackathon.name}
        </h3>
        <p className="text-sm text-neutral-500">
          {hackathon.organizer} · {hackathon.year}
        </p>
      </div>
      <p className="text-xs font-semibold text-tertiary sm:text-right">
        {hackathon.result}
      </p>
    </>
  );
}

function HackathonRow({ hackathon, children }: { hackathon: Hackathon; children: ReactNode }) {
  const className =
    "group/hackathon grid gap-x-6 gap-y-1 py-5 sm:grid-cols-[1fr_auto] sm:items-baseline";

  if (!hackathon.url) return <div className={className}>{children}</div>;

  return (
    <a
      href={hackathon.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={hackathon.name}
      className={className}
    >
      {children}
    </a>
  );
}

// The hackathons. Moving the pointer over one opens a miniature
// browser window with its page next to the pointer. Only on devices with a
// hovering pointer — touch screens just see the list.
export function HackathonsList({ hackathons }: HackathonsListProps) {
  const [shownId, setShownId] = useState<string>(hackathons[0]?.id ?? "");
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const place = useCallback((pointerX: number, pointerY: number) => {
    const preview = previewRef.current;
    if (!preview) return;

    let x = pointerX + POINTER_OFFSET;
    let y = pointerY + POINTER_OFFSET;
    if (x + PREVIEW_WIDTH + EDGE_MARGIN > window.innerWidth) {
      x = pointerX - POINTER_OFFSET - PREVIEW_WIDTH;
    }
    if (y + PREVIEW_HEIGHT + EDGE_MARGIN > window.innerHeight) {
      y = pointerY - POINTER_OFFSET - PREVIEW_HEIGHT;
    }
    preview.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const shownHackathon = hackathons.find((hackathon) => hackathon.id === shownId);

  return (
    <>
      <ul
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") place(event.clientX, event.clientY);
        }}
        onPointerLeave={() => setPreviewVisible(false)}
      >
        {hackathons.map((hackathon) => (
          <li
            key={hackathon.id}
            className="border-t border-neutral-200 first:border-t-0 first:*:pt-0 last:*:pb-0"
            onPointerEnter={(event) => {
              if (event.pointerType !== "mouse") return;
              place(event.clientX, event.clientY);
              setShownId(hackathon.id);
              setPreviewVisible(true);
            }}
          >
            <HackathonRow hackathon={hackathon}>
              <HackathonRowContent hackathon={hackathon} />
            </HackathonRow>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-neutral-400 [@media(hover:none)]:hidden">
        Pasa el mouse sobre un hackatón para ver su pantalla.
      </p>

      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-30 border border-neutral-300 bg-primary shadow-[0_16px_36px_-14px_rgba(0,0,0,0.3)] transition-opacity duration-150 [@media(hover:none)]:hidden"
        style={{
          width: PREVIEW_WIDTH,
          opacity: isPreviewVisible ? 1 : 0,
          transform: "translate3d(-9999px, 0, 0)",
        }}
      >
        <div
          className="flex items-center gap-1 border-b border-neutral-200 px-2"
          style={{ height: BAR_HEIGHT }}
        >
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          ))}
        </div>
        <div
          className="relative flex items-center justify-center overflow-hidden bg-neutral-100"
          style={{ height: SCREEN_HEIGHT }}
        >
          {shownHackathon?.previewImage ? (
            <Image
              src={shownHackathon.previewImage}
              alt=""
              fill
              sizes={`${SCREEN_WIDTH}px`}
              className="object-cover object-top"
            />
          ) : (
            <span className="px-3 text-center text-xs font-medium text-neutral-500">
              {shownHackathon?.name}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
