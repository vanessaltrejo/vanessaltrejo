import type { CSSProperties } from "react";

type PhotoWindowProps = {
  // Left undefined until the real photo exists — renders a placeholder
  // instead of pointing an <img> at a file that isn't there yet.
  src?: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

function PlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-8 w-8 text-[#9a9a9a]"
    >
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M8 6l1.5-2.5h5L16 6" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

// A photo framed as a tiny macOS window (traffic-light title bar + content
// pane), used to scatter portrait shots around the hero like desktop icons.
export function PhotoWindow({ src, alt, className = "", style }: PhotoWindowProps) {
  return (
    <div
      className={`absolute overflow-hidden rounded-lg border border-black/10 bg-[#e8e8e8] shadow-2xl ${className}`}
      style={style}
    >
      <div className="flex items-center gap-1.5 border-b border-black/10 bg-gradient-to-b from-[#f0f0f0] to-[#d8d8d8] px-2.5 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#cfcfcf]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <PlaceholderIcon />
        )}
      </div>
    </div>
  );
}
