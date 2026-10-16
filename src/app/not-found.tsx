import Link from "next/link";
import { SiteShell } from "@/components/site/SiteShell";
import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";

const COPY = {
  heading: "Página no encontrada",
  button: "Volver al inicio",
};

// From Uiverse.io by preet_7613 — a blinking, looking-around face, styled
// via the .face-404 rules in globals.css (kept there, not inline, since
// plain <style> tags aren't scoped in the App Router the way they are in
// styled-jsx).
function BlinkingFace() {
  return (
    <svg className="face-404" viewBox="0 0 320 380">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={25}
      >
        <g className="face__eyes" transform="translate(0,112.5)">
          <g transform="translate(15,0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
          <g transform="translate(230,0)">
            <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
            <polyline
              className="face__pupil"
              points="55,120 55,155"
              strokeDasharray="35 35"
            />
          </g>
        </g>
        <rect
          className="face__nose"
          x={132.5}
          y={112.5}
          width={55}
          height={155}
          rx={4}
          ry={4}
        />
        <g transform="translate(65,334)" strokeDasharray="102 102">
          <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
          <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
        </g>
      </g>
    </svg>
  );
}

// Lives outside the (site) route group (Next renders the global 404 from
// here), so it wraps itself in the same SiteShell — navbar, pink cursor and
// white surface included.
export default function NotFound() {
  return (
    <SiteShell>
      {/* Everything centered in the free space below the navbar: the black
          face and the title side by side (stacked on phones), the pink
          button under them. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <div className="text-secondary">
            <BlinkingFace />
          </div>
          <h1
            className="text-5xl leading-none tracking-tight text-secondary sm:text-8xl"
            style={DISPLAY_SERIF_STYLE}
          >
            {COPY.heading}
          </h1>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-tertiary px-6 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          {COPY.button}
        </Link>
      </div>
    </SiteShell>
  );
}
