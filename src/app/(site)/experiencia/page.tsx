import type { Metadata } from "next";
import { PageHeading } from "@/components/site/PageHeading";
import { ExperienceShowcase } from "@/components/experience/ExperienceShowcase";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.experience;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeading title={heading} description={description} />
      <ExperienceShowcase />
    </>
  );
}
