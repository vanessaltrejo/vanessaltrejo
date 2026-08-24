"use client";

import { useLanguage } from "@/lib/language-context";
import type { ExperienceTimelineItemCopy } from "@/lib/translations";

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
        <p className="text-xs uppercase tracking-wide text-white/40">
          {item.dateRange}
        </p>
        <h4 className="mt-1 text-base font-bold text-white sm:text-lg">
          {item.title}
        </h4>
        <p className="text-sm text-white/50">{item.location}</p>
        <p className="mt-1.5 text-sm leading-6 text-white/60">
          {item.description}
        </p>
      </div>
    </div>
  );
}

// Two columns inside the Experiencia folder: a timeline of past work on the
// left, and Habilidades (skills — the list itself still to come) on the
// right, so both live under the same tab instead of splitting across two.
export function ExperienceShowcase() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        {t.experienceShowcase.timeline.map((item, index) => (
          <TimelineItem
            key={item.title}
            item={item}
            isLast={index === t.experienceShowcase.timeline.length - 1}
          />
        ))}
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          {t.experienceShowcase.skillsTitle}
        </h3>
      </div>
    </div>
  );
}
