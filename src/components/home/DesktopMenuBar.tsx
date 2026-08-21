"use client";

import { useEffect, useState } from "react";

type DesktopMenuBarProps = {
  onNavigate: (sectionId: string) => void;
};

type NavItem = {
  label: string;
  sectionId: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Proyectos", sectionId: "proyectos" },
  { label: "Contacto", sectionId: "contacto" },
];

// Menu-bar style clock, e.g. "dom, 25 may  6:00 p. m." — updated on an
// interval rather than once, so it stays live like a real OS menu bar.
function useMenuBarClock(): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

    function tick() {
      setLabel(formatter.format(new Date()));
    }

    tick();
    const intervalId = window.setInterval(tick, 15_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return label;
}

export function DesktopMenuBar({ onNavigate }: DesktopMenuBarProps) {
  const clockLabel = useMenuBarClock();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-between border-b border-white/10 bg-black/25 px-3 text-[13px] text-white backdrop-blur-md sm:px-4">
      <div className="flex items-center gap-4 sm:gap-5">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[9px] font-black leading-none text-black">
          VT
        </span>
        <span className="font-semibold tracking-tight">Vanessa Trejo</span>
        <nav className="hidden items-center gap-4 sm:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.sectionId}
              type="button"
              onClick={() => onNavigate(item.sectionId)}
              className="text-white/80 transition-colors hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 text-white/80 sm:gap-4">
        <svg
          viewBox="0 0 16 12"
          className="h-3 w-4 fill-current"
          aria-hidden="true"
        >
          <path d="M8 10.4a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm-2.9-3.1a4.1 4.1 0 0 1 5.8 0 .5.5 0 0 1 0 .7l-.6.6a.5.5 0 0 1-.7 0 2.6 2.6 0 0 0-3.5 0 .5.5 0 0 1-.7 0l-.6-.6a.5.5 0 0 1 .3-.7Zm-2.6-2.6a7.8 7.8 0 0 1 11 0 .5.5 0 0 1 0 .7l-.6.6a.5.5 0 0 1-.7 0 5.9 5.9 0 0 0-8.4 0 .5.5 0 0 1-.7 0l-.6-.6a.5.5 0 0 1 0-.7Z" />
        </svg>
        <svg
          viewBox="0 0 24 12"
          className="h-3 w-5"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="1"
            width="19"
            height="10"
            rx="2"
            className="fill-none stroke-current"
            strokeWidth="1"
          />
          <rect x="21.5" y="4" width="1.5" height="4" rx="0.5" className="fill-current" />
          <rect x="2.5" y="2.5" width="14" height="7" rx="1" className="fill-current" />
        </svg>
        <span className="min-w-max font-medium tabular-nums">{clockLabel}</span>
      </div>
    </header>
  );
}
