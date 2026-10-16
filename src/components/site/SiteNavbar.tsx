import Link from "next/link";
import { NavbarHeightSync } from "@/components/site/NavbarHeightSync";
import { NavbarMascot } from "@/components/site/NavbarMascot";
import { SiteNavLinks } from "@/components/site/SiteNavLinks";
import { siteViews } from "@/lib/site-nav";

const { home } = siteViews;

export function SiteNavbar() {
  return (
    // Fixed (not sticky) so that the browser's rubber-band overscroll moves
    // the page but leaves the navbar where it is, like on apple.com. The
    // content makes room for it (see SiteShell and NavbarHeightSync).
    <header data-site-navbar="" className="fixed inset-x-0 top-0 z-40 bg-primary">
      {/* Wraps onto a second row on very narrow phones instead of
          squeezing the name and the links together; below 375px the text
          shrinks a notch so the five links still fit on one line between
          the 40px margins. */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 px-(--page-margin) py-4 text-xs font-medium max-[374px]:text-[11px] sm:grid sm:grid-cols-[1fr_auto_1fr] sm:py-2 sm:text-[13px]">
        {/* The way back home. Always black — it never takes the pink of the
            active view. */}
        <Link
          href={home.href}
          aria-label={`${home.heading} — ${home.navLabel}`}
          className="justify-self-start text-secondary"
        >
          {home.heading}
        </Link>
        {/* The mascot sits in the right corner, on every screen size. It comes
            before the links in the markup so that on phones it shares the
            first row with the name; from sm up the grid columns put each
            piece where it belongs. */}
        <NavbarMascot className="h-7 justify-self-end sm:col-start-3 sm:row-start-1 sm:h-9" />
        <div className="max-sm:basis-full sm:col-start-2 sm:row-start-1">
          <SiteNavLinks />
        </div>
      </div>
      <NavbarHeightSync />
    </header>
  );
}
