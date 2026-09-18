import { ProjectDirectory } from "@/features/projects/project-directory";
import { loadProjectDirectory } from "@/features/projects/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProjectsPageProps = {
  searchParams: Promise<{ project?: string | string[] }>;
};

export default async function ToroProjectsPage({ searchParams }: ProjectsPageProps) {
  const [projects, params] = await Promise.all([loadProjectDirectory(), searchParams]);
  const rawProject = Array.isArray(params.project) ? params.project[0] : params.project;
  const selectedProjectId = rawProject && uuidPattern.test(rawProject) ? rawProject : null;

  return <ProjectDirectory projects={projects} selectedProjectId={selectedProjectId} />;
}
