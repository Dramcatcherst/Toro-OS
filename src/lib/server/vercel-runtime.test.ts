import { afterEach, describe, expect, it } from "vitest";

import { getToroVercelRuntimeConfig } from "./vercel-runtime";

const originalProjectId = process.env.VERCEL_PROJECT_ID;
const originalTeamId = process.env.VERCEL_TEAM_ID;

afterEach(() => {
  if (originalProjectId === undefined) delete process.env.VERCEL_PROJECT_ID;
  else process.env.VERCEL_PROJECT_ID = originalProjectId;

  if (originalTeamId === undefined) delete process.env.VERCEL_TEAM_ID;
  else process.env.VERCEL_TEAM_ID = originalTeamId;
});

describe("getToroVercelRuntimeConfig", () => {
  it("falls back to the Vercel project actually linked to Dramcatcherst/Toro-OS", () => {
    delete process.env.VERCEL_PROJECT_ID;
    delete process.env.VERCEL_TEAM_ID;

    expect(getToroVercelRuntimeConfig()).toEqual({
      projectId: "prj_nxerFw9ciNews6tUMAah3GAlAJzs",
      teamId: "team_zUbLBlOtoQBHDfGMYpDlg0XO",
      projectName: "toro-pr11-preview",
      repository: "Dramcatcherst/Toro-OS",
      projectUrl: "https://toro-pr11-preview.vercel.app",
    });
  });

  it("accepts explicit deployment environment overrides without changing canonical identity metadata", () => {
    process.env.VERCEL_PROJECT_ID = "prj_override";
    process.env.VERCEL_TEAM_ID = "team_override";

    expect(getToroVercelRuntimeConfig()).toEqual({
      projectId: "prj_override",
      teamId: "team_override",
      projectName: "toro-pr11-preview",
      repository: "Dramcatcherst/Toro-OS",
      projectUrl: "https://toro-pr11-preview.vercel.app",
    });
  });

  it("never falls back to the legacy toro-os-v03 project", () => {
    delete process.env.VERCEL_PROJECT_ID;
    const config = getToroVercelRuntimeConfig();
    expect(config.projectId).not.toBe("prj_nzsVpQZree5WuErakMPKIyiK6gsA");
  });
});
