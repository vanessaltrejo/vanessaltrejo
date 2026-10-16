import { ContactFooter } from "@/components/site/ContactFooter";
import { PageHeading } from "@/components/site/PageHeading";
import { ProjectStack } from "@/components/home/ProjectStack";
import { getProjects } from "@/lib/projects/projectsService";
import { siteViews } from "@/lib/site-nav";

export default async function HomePage() {
  const { heading, description } = siteViews.home;
  const projects = await getProjects();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeading
        title={heading}
        description={description}
        align="center"
        size="full"
      />
      {/* Takes the free space between the title and the contact block. */}
      <ProjectStack projects={projects} />
      <ContactFooter />
    </div>
  );
}
