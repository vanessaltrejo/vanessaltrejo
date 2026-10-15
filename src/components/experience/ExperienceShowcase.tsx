import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { siteContent, type ExperienceTimelineItem } from "@/lib/site-content";

function TimelineItem({
  item,
  isLast,
}: {
  item: ExperienceTimelineItem;
  isLast: boolean;
}) {
  return (
    <li className="flex gap-4">
      {/* Bullet + connecting line — the line only renders between items,
          not past the last one. */}
      <div className="flex flex-col items-center">
        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-secondary bg-primary" />
        {!isLast && <span className="mt-1.5 w-px flex-1 bg-neutral-200" />}
      </div>
      <div className={isLast ? "pb-0" : "pb-8"}>
        <p className="text-xs font-semibold text-neutral-500">
          {item.dateRange}
        </p>
        <h3 className="mt-1 text-lg text-secondary">{item.title}</h3>
        <p className="text-sm text-neutral-500">{item.location}</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
          {item.description}
        </p>
      </div>
    </li>
  );
}

const SECTION_TITLE_CLASSNAME = "text-3xl leading-tight tracking-tight text-secondary";

// Timeline of past work on the left; skills and collaborations (their
// lists are still to come) stacked on the right.
export function ExperienceShowcase() {
  const { timeline, skillsTitle, companiesTitle } = siteContent.experienceShowcase;

  return (
    <div className="mt-8 grid w-full grid-cols-1 gap-12 sm:mt-12 lg:grid-cols-2 lg:gap-16">
      <ol>
        {timeline.map((item, index) => (
          <TimelineItem
            key={item.title}
            item={item}
            isLast={index === timeline.length - 1}
          />
        ))}
      </ol>
      <div className="flex flex-col gap-10">
        <section>
          <h2 className={SECTION_TITLE_CLASSNAME} style={DISPLAY_SERIF_STYLE}>
            {skillsTitle}
          </h2>
        </section>
        <section className="border-t border-neutral-200 pt-8">
          <h2 className={SECTION_TITLE_CLASSNAME} style={DISPLAY_SERIF_STYLE}>
            {companiesTitle}
          </h2>
        </section>
      </div>
    </div>
  );
}
