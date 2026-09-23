import "server-only";

const DEFAULT_PROJECT_ID = "prj_nxerFw9ciNews6tUMAah3GAlAJzs";
const DEFAULT_TEAM_ID = "team_zUbLBlOtoQBHDfGMYpDlg0XO";

export function getToroVercelRuntimeConfig() {
  return {
    projectId: process.env.VERCEL_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID,
    teamId: process.env.VERCEL_TEAM_ID?.trim() || DEFAULT_TEAM_ID,
    projectName: "toro-pr11-preview",
    repository: "Dramcatcherst/Toro-OS",
    projectUrl: "https://toro-pr11-preview.vercel.app",
  };
}
