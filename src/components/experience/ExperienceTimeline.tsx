import type {
  ExperienceEntry,
  ExperienceKind,
} from "@/lib/experience/types";

type ExperienceTimelineProps = {
  entries: ExperienceEntry[];
};

const KIND_LABELS: Record<ExperienceKind, string> = {
  internship: "Prácticas profesionales",
  freelance: "Freelance",
};

function TimelineItem({
  entry,
  isLast,
}: {
  entry: ExperienceEntry;
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
          {entry.dateRange} · {KIND_LABELS[entry.kind]}
        </p>
        <h3 className="mt-1 text-lg text-secondary">{entry.role}</h3>
        <p className="text-sm text-neutral-500">
          {entry.organization} · {entry.location}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
          {entry.description}
        </p>
      </div>
    </li>
  );
}

// Professional internships and freelance work in one timeline, newest first,
// each one tagged with which of the two it was.
export function ExperienceTimeline({ entries }: ExperienceTimelineProps) {
  return (
    <ol>
      {entries.map((entry, index) => (
        <TimelineItem
          key={entry.id}
          entry={entry}
          isLast={index === entries.length - 1}
        />
      ))}
    </ol>
  );
}
