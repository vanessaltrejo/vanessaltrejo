import type { ReactNode } from "react";

type SectionTitleProps = {
  id: string;
  children: ReactNode;
};

// Title of a block on the Contacto view (the form, the FAQ). Inter medium,
// the same face as the email on Inicio — inherited from the site shell, so no
// font override here.
export function SectionTitle({ id, children }: SectionTitleProps) {
  return (
    <h2
      id={id}
      className="text-2xl font-medium leading-tight tracking-tight text-secondary sm:text-3xl"
    >
      {children}
    </h2>
  );
}
