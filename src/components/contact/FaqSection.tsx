import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { SectionTitle } from "@/components/contact/SectionTitle";
import { siteContent } from "@/lib/site-content";

export function FaqSection() {
  const { faq } = siteContent;

  return (
    <section aria-labelledby="faq-title">
      <SectionTitle id="faq-title">{faq.heading}</SectionTitle>

      <div className="mt-5">
        <FaqAccordion />
      </div>
    </section>
  );
}
