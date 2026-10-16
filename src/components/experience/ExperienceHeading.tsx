type ExperienceHeadingProps = {
  title: string;
  description?: string;
};

// The title of a block of Experiencia, with an optional short text. Set in
// Inter, medium and tight, like the email in the contact footer.
export function ExperienceHeading({ title, description }: ExperienceHeadingProps) {
  return (
    <div>
      <h2 className="text-3xl font-medium leading-tight tracking-tight text-secondary">
        {title}
      </h2>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-6 text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}
