import type { ComponentType } from "react";
import {
  ArrowUpRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/site/icons";
import {
  CONTACT_EMAIL,
  CV_URL,
  socialLinks,
  type SocialNetworkId,
} from "@/lib/site-links";

const socialIcons: Record<SocialNetworkId, ComponentType<{ className?: string }>> = {
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  youtube: YouTubeIcon,
};

// Contact block of the Inicio view, left-aligned with the page title: the
// email set large in Inter, then the social logos and the CV download as a
// pill.
export function HomeContact() {
  return (
    // @container so the narrow-phone variants below (@max-[326px]:) react
    // to this block's own width, not the viewport's.
    <section
      aria-label="Contacto"
      className="@container flex flex-col gap-8 border-t border-neutral-200 pt-6"
    >
      {/* On phones the email is sized so it ends exactly where the "Descargar
          CV" button below it ends (22.6px). The button row needs 327px; in
          narrower blocks (≤ 326px) the buttons shrink so the row still fits
          on one line, and the email shrinks with it (19px). From sm up it
          scales with the viewport instead. */}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="group inline-flex items-start gap-3 self-start break-all text-[22.6px] font-medium leading-none tracking-tight text-secondary transition-colors hover:text-tertiary @max-[326px]:text-[19px] sm:text-[clamp(1.25rem,4.2vw,3rem)]"
      >
        <span>{CONTACT_EMAIL}</span>
        <ArrowUpRightIcon className="mt-[0.05em] h-[0.6em] w-[0.6em] shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-1" />
      </a>

      <div className="flex flex-wrap items-center gap-3 @max-[326px]:gap-2">
        <ul className="flex items-center gap-3 @max-[326px]:gap-2">
          {socialLinks.map((link) => {
            const Icon = socialIcons[link.id];

            return (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-secondary transition-colors hover:border-tertiary hover:text-tertiary @max-[326px]:h-9 @max-[326px]:w-9"
                >
                  <Icon className="h-5 w-5" />
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href={CV_URL}
          download
          className="inline-flex h-11 items-center gap-2 rounded-full border border-secondary px-5 text-sm font-medium text-secondary transition-colors hover:bg-secondary hover:text-primary @max-[326px]:h-9 @max-[326px]:px-4 @max-[326px]:text-[13px]"
        >
          Descargar CV
          <DownloadIcon className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
