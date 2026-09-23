import { describe, expect, it } from "vitest";

import {
  CANONICAL_VERCEL_RUNTIME,
  resolveVercelRuntimeConfig,
} from "./vercel-runtime";

describe("resolveVercelRuntimeConfig", () => {
  it("defaults to the canonical TORO Brain Vercel runtime", () => {
    expect(resolveVercelRuntimeConfig({})).toEqual({
      projectId: "prj_nxerFw9ciNews6tUMAah3GAlAJzs",
      teamId: "team_zUbLBlOtoQBHDfGMYpDlg0XO",
      productionAlias: "https://toro-pr11-preview.vercel.app",
      branchAlias:
        "https://toro-pr11-preview-git-main-dreamcatcher-s-projects.vercel.app",
    });
  });

  it("allows explicit project/team overrides without changing canonical aliases", () => {
    expect(
      resolveVercelRuntimeConfig({
        VERCEL_PROJECT_ID: "prj_override",
        VERCEL_TEAM_ID: "team_override",
      }),
    ).toEqual({
      projectId: "prj_override",
      teamId: "team_override",
      productionAlias: CANONICAL_VERCEL_RUNTIME.productionAlias,
      branchAlias: CANONICAL_VERCEL_RUNTIME.branchAlias,
    });
  });

  it("never contains the legacy toro-os-v03 project as a fallback", () => {
    const serialized = JSON.stringify(CANONICAL_VERCEL_RUNTIME);
    expect(serialized).not.toContain("prj_nzsVpQZree5WuErakMPKIyiK6gsA");
    expect(serialized).not.toContain("toro-os-v03.vercel.app");
  });
});
