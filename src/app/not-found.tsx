import Link from "next/link";
import { PageHeading } from "@/components/site/PageHeading";
import { SiteShell } from "@/components/site/SiteShell";

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
      <PageHeading title={COPY.heading} />

      <div className="mt-10 flex flex-wrap items-center gap-8 sm:mt-14">
        <div className="text-tertiary">
          <BlinkingFace />
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-secondary px-6 text-sm font-medium text-primary transition-colors hover:bg-tertiary"
        >
          {COPY.button}
        </Link>
      </div>
    </SiteShell>
  );
}
