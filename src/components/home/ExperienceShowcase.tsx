"use client";

import { useLanguage } from "@/lib/language-context";
import type { ExperienceTimelineItemCopy } from "@/lib/translations";

// The site's default body font is Times New Roman (see globals.css) — each
// timeline entry's own title uses that explicitly, while its description
// opts back into the original OS system font instead, for contrast.
const TIMES_NEW_ROMAN = "'Times New Roman', Times, serif";
const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function TimelineItem({
  item,
  isLast,
}: {
  item: ExperienceTimelineItemCopy;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4 pl-1">
      {/* Bullet + connecting line — the line only renders between items
          (not past the last one), same idea as NotesContactCard's step
          progress indicator elsewhere on the site. */}
      <div className="flex flex-col items-center">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white/70 bg-white/20" />
        {!isLast && <span className="mt-1.5 w-px flex-1 bg-white/15" />}
      </div>
      <div className={isLast ? "pb-0" : "pb-6"}>
        <p className="text-xs tracking-wide text-white/40">{item.dateRange}</p>
        <h4
          className="mt-1 text-base text-white sm:text-lg"
          style={{ fontFamily: TIMES_NEW_ROMAN }}
        >
          {item.title}
        </h4>
        <p className="text-sm text-white/50">{item.location}</p>
        <p
          className="mt-1.5 text-sm leading-6 text-white/60"
          style={{ fontFamily: SYSTEM_FONT_STACK }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

// Same size/weight as every other folder's own title (see FolderSection),
// used here twice — once per column — instead of FolderSection rendering
// one above both, so "Habilidades" reads as equally prominent as
// "Experiencia" and sits at the same height, not a smaller sub-heading a
// row lower.
const COLUMN_TITLE_CLASSNAME = "text-2xl leading-tight tracking-tight sm:text-4xl";
const COLUMN_TITLE_STYLE = { fontFamily: "var(--font-instrument-serif)" };

// Two columns inside the Experiencia folder: a timeline of past work on the
// left, and Habilidades (skills — the list itself still to come) on the
// right, so both live under the same tab instead of splitting across two.
export function ExperienceShowcase() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <h2 className={`${COLUMN_TITLE_CLASSNAME} mb-4 sm:mb-6`} style={COLUMN_TITLE_STYLE}>
          {t.sections["sobre-mi"].title}
        </h2>
        {t.experienceShowcase.timeline.map((item, index) => (
          <TimelineItem
            key={item.title}
            item={item}
            isLast={index === t.experienceShowcase.timeline.length - 1}
          />
        ))}
      </div>
      <div className="flex h-full flex-col">
        {/* min-h-0 on both halves — without it, a flex item's default
            min-height (its own content's natural size) can force it past
            its own flex-grow share whenever the other half's content is
            shorter, which is exactly what made "Habilidades" look smaller
            than "He colaborado con" at an even 1:1 split (that half's
            extra border/padding pushed past its share and ate into this
            one). With it, the 3:2 split below lands exactly where set,
            regardless of either half's content — a bit more room for
            Habilidades than for the companies section under it. */}
        <div className="min-h-0 flex-[3]">
          <h2 className={COLUMN_TITLE_CLASSNAME} style={COLUMN_TITLE_STYLE}>
            {t.experienceShowcase.skillsTitle}
          </h2>
        </div>
        <div className="min-h-0 flex-[2] border-t border-white/10 pt-4 sm:pt-6">
          <h2 className={COLUMN_TITLE_CLASSNAME} style={COLUMN_TITLE_STYLE}>
            {t.experienceShowcase.companiesTitle}
          </h2>
        </div>
      </div>
    </div>
  );
}
