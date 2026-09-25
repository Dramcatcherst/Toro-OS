import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readText(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

test("dashboard route reuses the role-aware Mi TORO resolver", async () => {
  const page = await readText("src/app/dashboard/page.tsx");

  assert.match(page, /resolveCurrentToroReadOnlyMenu/);
  assert.match(page, /Today|Hoy/);
  assert.match(page, /Dinero/);
  assert.match(page, /Studio/);
  assert.match(page, /\/brain/);
});

test("dashboard section contract keeps one unified navigation model", async () => {
  const sections = await readText("src/features/dashboard/sections.ts");

  for (const key of [
    "today",
    "money",
    "studio",
    "customers",
    "operations",
    "people",
    "growth",
    "legal_risk",
    "assets_spaces",
    "projects",
    "systems",
  ]) {
    assert.match(sections, new RegExp(`key:\\s*["']${key}["']`));
  }

  assert.match(sections, /owner_executive/);
  assert.match(sections, /finance/);
  assert.match(sections, /reception/);
  assert.match(sections, /maintenance/);
  assert.match(sections, /growth/);
  assert.match(sections, /systems/);
});

test("dashboard MVP keeps the legacy technical cockpit outside the new route", async () => {
  const dashboard = await readText("src/app/dashboard/page.tsx");
  const commandHome = await readText("src/app/page.tsx");

  assert.match(commandHome, /TORO command center/);
  assert.doesNotMatch(dashboard, /Persistent Approval Console/);
  assert.match(dashboard, /\/|href/);
});
