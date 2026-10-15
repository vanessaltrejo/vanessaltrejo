import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";

type PageHeadingProps = {
  title: string;
  description?: string;
};

// Large view title on the left with a short intro aligned to its baseline
// on the right — shared by every view of the site.
export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="flex w-full flex-col gap-4 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
      <h1
        className="text-[clamp(3.5rem,11vw,9rem)] leading-[0.9] tracking-tight text-secondary"
        style={DISPLAY_SERIF_STYLE}
      >
        {title}
      </h1>
      {description && (
        <p className="max-w-xs text-sm text-neutral-500 sm:text-right">
          {description}
        </p>
      )}
    </div>
  );
}
