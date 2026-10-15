import type { Metadata } from "next";
import { PageHeading } from "@/components/site/PageHeading";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { getProjects } from "@/lib/projects/projectsService";
import { siteViews } from "@/lib/site-nav";

const { heading, description } = siteViews.projects;

export const metadata: Metadata = {
  title: `${heading} | Vanessa Trejo`,
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeading title={heading} description={description} />
      <ProjectsGrid projects={projects} />
    </>
  );
}
