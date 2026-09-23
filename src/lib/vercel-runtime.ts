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

export function resolveVercelRuntimeConfig(env?: {
  VERCEL_PROJECT_ID?: string;
  VERCEL_TEAM_ID?: string;
}): VercelRuntimeConfig {
  const source = env ?? process.env;

  return {
    projectId:
      source.VERCEL_PROJECT_ID?.trim() || CANONICAL_VERCEL_RUNTIME.projectId,
    teamId:
      source.VERCEL_TEAM_ID?.trim() || CANONICAL_VERCEL_RUNTIME.teamId,
    productionAlias: CANONICAL_VERCEL_RUNTIME.productionAlias,
    branchAlias: CANONICAL_VERCEL_RUNTIME.branchAlias,
  };
}
