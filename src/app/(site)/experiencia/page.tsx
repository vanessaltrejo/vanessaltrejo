import type { Metadata } from "next";
import { CompaniesStrip } from "@/components/experience/CompaniesStrip";
import { HackathonsList } from "@/components/experience/HackathonsList";
import { ExperienceHeading } from "@/components/experience/ExperienceHeading";
import { ExperienceTimeline } from "@/components/experience/ExperienceTimeline";
import { PageHeading } from "@/components/site/PageHeading";
import { getExperience } from "@/lib/experience/experienceService";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.experience;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default async function ExperiencePage() {
  const { experience, hackathons, companies } = await getExperience();

  return (
    <>
      <PageHeading title={heading} description={description} />
      <div className="mt-8 flex flex-col gap-12 sm:mt-12">
        {/* The timeline on the left half, the hackathons on the right half. */}
        <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <ExperienceTimeline entries={experience} />
          <section className="flex flex-col gap-8">
            <ExperienceHeading
              title="Hackatones"
              description="Soluciones a retos de 24 a 48 horas, de las que salieron estos prototipos."
            />
            <HackathonsList hackathons={hackathons} />
          </section>
        </div>
        <section className="flex flex-col gap-8 border-t border-neutral-200 pt-8">
          <ExperienceHeading
            title="He colaborado con"
            description="Empresas con las que he trabajado y colaborado."
          />
          <CompaniesStrip companies={companies} />
        </section>
      </div>
    </>
  );
}
