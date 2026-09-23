export const CANONICAL_VERCEL_RUNTIME = {
  projectId: "prj_nxerFw9ciNews6tUMAah3GAlAJzs",
  teamId: "team_zUbLBlOtoQBHDfGMYpDlg0XO",
  productionAlias: "https://toro-pr11-preview.vercel.app",
  branchAlias:
    "https://toro-pr11-preview-git-main-dreamcatcher-s-projects.vercel.app",
} as const;

export type VercelRuntimeConfig = {
  projectId: string;
  teamId: string;
  productionAlias: string;
  branchAlias: string;
};

export function resolveVercelRuntimeConfig(env: {
  VERCEL_PROJECT_ID?: string;
  VERCEL_TEAM_ID?: string;
} = process.env): VercelRuntimeConfig {
  return {
    projectId:
      env.VERCEL_PROJECT_ID?.trim() || CANONICAL_VERCEL_RUNTIME.projectId,
    teamId: env.VERCEL_TEAM_ID?.trim() || CANONICAL_VERCEL_RUNTIME.teamId,
    productionAlias: CANONICAL_VERCEL_RUNTIME.productionAlias,
    branchAlias: CANONICAL_VERCEL_RUNTIME.branchAlias,
  };
}
