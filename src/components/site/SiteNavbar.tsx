import { SiteNavLinks } from "@/components/site/SiteNavLinks";

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-primary">
      {/* Wraps onto a second row on very narrow phones instead of
          squeezing the name and the three links together. */}
      <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 text-xs font-medium sm:grid sm:grid-cols-[1fr_auto_1fr] sm:text-[13px]">
        {/* Plain text on purpose, not a link — "Inicio" in the nav is the
            way back to the root. */}
        <span className="justify-self-start text-secondary">Vanessa Trejo</span>
        <SiteNavLinks />
        <span className="hidden justify-self-end text-neutral-500 sm:block">
          © {new Date().getFullYear()}
        </span>
      </div>
    </header>
  );
}
