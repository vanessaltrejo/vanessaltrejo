import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqSection } from "@/components/contact/FaqSection";
import { PageHeading } from "@/components/site/PageHeading";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.contact;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeading title={heading} description={description} />
      {/* Form on the left, FAQ beside it; stacked on small screens. */}
      <div className="mt-10 grid w-full gap-14 sm:mt-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
        <ContactForm />
        <FaqSection />
      </div>
    </>
  );
}
