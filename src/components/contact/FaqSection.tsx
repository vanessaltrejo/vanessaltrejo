import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { siteContent } from "@/lib/site-content";

export function FaqSection() {
  const { faq } = siteContent;

  return (
    <section aria-labelledby="faq-title">
      <h2
        id="faq-title"
        className="text-3xl leading-tight tracking-tight text-secondary sm:text-4xl"
        style={DISPLAY_SERIF_STYLE}
      >
        {faq.heading}
      </h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500">{faq.description}</p>

      <div className="mt-6">
        <FaqAccordion />
      </div>
    </section>
  );
}
