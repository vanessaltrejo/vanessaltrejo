import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqSection } from "@/components/contact/FaqSection";
import { ContactFooter } from "@/components/site/ContactFooter";
import { PageHeading } from "@/components/site/PageHeading";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.contact;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeading title={heading} description={description} />
      {/* The form with the FAQ underneath, in one column as wide as the
          page title (never wider than the screen). */}
      <div className="mt-10 flex w-full max-w-(--contact-column-width) flex-col gap-16 sm:mt-14">
        <ContactForm />
        <FaqSection />
      </div>
      {/* Same footer as Inicio, pushed to the bottom of the screen when the
          page is short; the top padding keeps a gap from the content. */}
      <div className="mt-auto pt-16">
        <ContactFooter />
      </div>
    </div>
  );
}
