import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  REQUIRED_MENU_PROFILES,
  auditMenuArchitecture,
} from "../scripts/menu-profile-static-audit.mjs";

async function load(path) {
  return JSON.parse(await readFile(new URL("../" + path, import.meta.url), "utf8"));
}

const [menus, messages, toolbox] = await Promise.all([
  load("data/toro_conversational_menu_profiles_v1.json"),
  load("data/toro_role_message_pack_v1.json"),
  load("data/toro_role_toolbox_v1.json"),
]);

test("menu/message/toolbox architecture is aligned", () => {
  const result = auditMenuArchitecture({ menus, messages, toolbox });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.requiredProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.menuProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.messageProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.toolboxProfiles, REQUIRED_MENU_PROFILES.length);
  assert.ok(result.summary.boundMenuOptions >= 70);
});

test("missing message profile fails closed", () => {
  const broken = structuredClone(messages);
  delete broken.profiles.reception;
  const result = auditMenuArchitecture({ menus, messages: broken, toolbox });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("missing message profile reception"));
});

test("menu capability must exist in role toolbox", () => {
  const broken = structuredClone(menus);
  const reception = broken.profiles.find((p) => p.id === "reception");
  reception.primary[0].capability = "guest.nonexistent";
  const result = auditMenuArchitecture({ menus: broken, messages, toolbox });
  assert.equal(result.status, "FAIL");
  assert.ok(
    result.errors.some((e) =>
      e.includes("menu capability missing from toolbox reception"),
    ),
  );
});

test("dead-button safety rule is mandatory", () => {
  const broken = structuredClone(toolbox);
  broken.rules.dead_buttons_forbidden = false;
  const result = auditMenuArchitecture({ menus, messages, toolbox: broken });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("dead-button rule missing"));
});
