import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";

type PageHeadingProps = {
  title: string;
  description?: string;
  // "start": title on the left with the intro on the right (the default).
  // "center": title, then the intro, centered.
  align?: "start" | "center";
  // "full": the big title of the home. "inner": 70% of it, for the other
  // pages (the default).
  size?: "full" | "inner";
};

const SIZE_CLASSNAMES = {
  full: "text-[length:var(--page-heading-size)]",
  inner: "text-[length:var(--page-heading-size-inner)]",
} as const;

const ALIGNMENT_CLASSNAMES = {
  start: {
    container: "sm:flex-row sm:items-end sm:justify-between",
    description: "sm:text-right",
  },
  center: {
    container: "items-center text-center",
    description: "",
  },
} as const;

// Large view title with a short intro aligned to its baseline on the right —
// shared by every view of the site. The title's size is the
// --page-heading-size variable (globals.css).
export function PageHeading({
  title,
  description,
  align = "start",
  size = "inner",
}: PageHeadingProps) {
  const classNames = ALIGNMENT_CLASSNAMES[align];

  return (
    <div
      className={`flex w-full flex-col gap-4 pt-8 sm:pt-14 ${classNames.container}`}
    >
      <h1
        className={`${SIZE_CLASSNAMES[size]} leading-[0.9] tracking-tight text-secondary`}
        style={DISPLAY_SERIF_STYLE}
      >
        {title}
      </h1>
      {description && (
        <p className={`max-w-xs text-sm text-neutral-500 ${classNames.description}`}>
          {description}
        </p>
      )}
    </div>
  );
}
