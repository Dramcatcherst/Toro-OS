import { defineConfig } from "playwright/test";

const port = Number(process.env.BRAIN_E2E_PORT ?? 3057);

export default defineConfig({
  testDir: "./tests",
  testMatch: "brain-search.e2e.spec.ts",
  use: { browserName: "chromium" },
  webServer: {
    command: `node ./node_modules/next/dist/bin/next start -p ${port}`,
    url: `http://localhost:${port}/brain`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: { TORO_BRAIN_CANONICAL_READ_ENABLED: "false" },
  },
});
