import type { Metadata } from "next";
import { PageHeading } from "@/components/site/PageHeading";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.about;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default function AboutPage() {
  return <PageHeading title={heading} description={description} />;
}
