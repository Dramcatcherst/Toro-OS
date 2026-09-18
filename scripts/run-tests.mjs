import { spawnSync } from "node:child_process";

const env = { ...process.env, NODE_ENV: "test" };
const result = spawnSync(
  process.execPath,
  [new URL("../node_modules/vitest/vitest.mjs", import.meta.url).pathname, "run", ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
