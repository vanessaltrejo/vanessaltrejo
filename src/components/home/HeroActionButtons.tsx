import type { SVGProps } from "react";

// Dummy destinations until the real CV file and profile URLs are provided.
const RESUME_URL = "#";
const GITHUB_URL = "#";
const LINKEDIN_URL = "#";

const BUTTON_CLASSES =
  "flex items-center justify-center rounded-md border border-black/20 bg-gradient-to-b from-[#f7f7f7] to-[#d6d6d6] text-[#171410] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.15)] transition-transform active:translate-y-px";

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export function HeroActionButtons() {
  return (
    <div
      className="hero-actions mt-6 flex items-center justify-center gap-3"
      style={{ transform: "scale(0)" }}
    >
      <a
        href={RESUME_URL}
        className={`${BUTTON_CLASSES} px-5 py-2 text-sm font-semibold`}
      >
        Download CV
      </a>
      <a
        href={GITHUB_URL}
        aria-label="GitHub"
        className={`${BUTTON_CLASSES} h-9 w-9`}
      >
        <GitHubIcon className="h-4 w-4" />
      </a>
      <a
        href={LINKEDIN_URL}
        aria-label="LinkedIn"
        className={`${BUTTON_CLASSES} h-9 w-9`}
      >
        <LinkedInIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
