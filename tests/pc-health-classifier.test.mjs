import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";

function classify(metrics) {
  const result = spawnSync(
    process.execPath,
    ["scripts/pc-health-classifier.mjs", "--classify-stdin"],
    {
      input: JSON.stringify(metrics),
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 0, result.stderr || "classifier exited non-zero");
  return JSON.parse(result.stdout);
}

test("healthy workstation metrics are classified HEALTHY", () => {
  const result = classify({
    diskFreeGB: 100,
    ramAvailableGB: 8,
    ramAvailablePercent: 50,
    cpuPercent: 20,
    heavyProcessCount: 1,
    largestGeneratedFolderGB: 0.5,
  });
  assert.equal(result.state, "HEALTHY");
});

test("low but non-critical headroom is classified CAUTION", () => {
  const result = classify({
    diskFreeGB: 15,
    ramAvailableGB: 2.5,
    ramAvailablePercent: 18,
    cpuPercent: 55,
    heavyProcessCount: 4,
    largestGeneratedFolderGB: 2.5,
  });
  assert.equal(result.state, "CAUTION");
  assert.ok(result.reasons.length > 0);
});

test("critically low disk blocks heavy local work", () => {
  const result = classify({
    diskFreeGB: 8,
    ramAvailableGB: 6,
    ramAvailablePercent: 40,
    cpuPercent: 25,
    heavyProcessCount: 1,
    largestGeneratedFolderGB: 0.5,
  });
  assert.equal(result.state, "STOP_HEAVY_WORK");
});

test("package exposes the official read-only PC health command", async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(pkg.scripts?.["health:pc"], "pwsh -NoProfile -File scripts/pc-health.ps1");
});
