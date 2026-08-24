import type { ReactNode } from "react";

type DesktopAppWindowProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

// The site's default body font is Times New Roman (see globals.css) — the
// title bar (real macOS window titles use the system font) opts back into
// the original OS system font instead.
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Shared dark "app window" chrome (traffic-light title bar, rounded
// corners) — the frame both NotesContactCard and FaqWindow sit inside, so
// they read as two separate apps open side by side on the desktop.
export function DesktopAppWindow({
  title,
  children,
  className = "",
}: DesktopAppWindowProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1e] shadow-2xl ${className}`}
    >
      <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#2c2c2e] px-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span
          className="flex-1 text-center text-xs font-medium text-white/50"
          style={{ fontFamily: SYSTEM_FONT_STACK }}
        >
          {title}
        </span>
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}
