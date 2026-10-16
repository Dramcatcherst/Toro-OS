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

const [menus, messages, toolbox, submenus] = await Promise.all([
  load("data/toro_conversational_menu_profiles_v1.json"),
  load("data/toro_role_message_pack_v1.json"),
  load("data/toro_role_toolbox_v1.json"),
  load("data/toro_conversational_submenus_v2.json"),
]);

test("menu/message/toolbox architecture is aligned", () => {
  const result = auditMenuArchitecture({ menus, messages, toolbox, submenus });
  assert.equal(result.status, "PASS");
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.requiredProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.menuProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.messageProfiles, REQUIRED_MENU_PROFILES.length);
  assert.equal(result.summary.toolboxProfiles, REQUIRED_MENU_PROFILES.length);
  assert.ok(result.summary.boundMenuOptions >= 70);
  assert.equal(result.summary.supermenuCategories, 10);
  assert.equal(result.summary.stableRoutes, 91);
  assert.equal(result.summary.targetBlockedCapabilities, 50);
});

test("missing message profile fails closed", () => {
  const broken = structuredClone(messages);
  delete broken.profiles.reception;
  const result = auditMenuArchitecture({ menus, messages: broken, toolbox, submenus });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("missing message profile reception"));
});

test("menu capability must exist in role toolbox", () => {
  const broken = structuredClone(menus);
  const reception = broken.profiles.find((p) => p.id === "reception");
  reception.primary[0].capability = "guest.nonexistent";
  const result = auditMenuArchitecture({ menus: broken, messages, toolbox, submenus });
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
  const result = auditMenuArchitecture({ menus, messages, toolbox: broken, submenus });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("dead-button rule missing"));
});

test("duplicate stable supermenu code fails closed", () => {
  const broken = structuredClone(submenus);
  broken.supermenu.categories[1].items[0].code = "MA1";
  const result = auditMenuArchitecture({ menus, messages, toolbox, submenus: broken });
  assert.equal(result.status, "FAIL");
  assert.ok(result.errors.includes("supermenu contains duplicate stable codes"));
});

test("an undeclared supermenu capability fails closed", () => {
  const broken = structuredClone(submenus);
  broken.supermenu.categories[1].items[0].capability = "typo.nonexistent";
  const result = auditMenuArchitecture({ menus, messages, toolbox, submenus: broken });
  assert.equal(result.status, "FAIL");
  assert.ok(
    result.errors.some((error) =>
      error.includes("neither registered nor TARGET_BLOCKED"),
    ),
  );
});

test("TARGET_BLOCKED metadata and registry separation fail closed", () => {
  const wrongStatus = structuredClone(submenus);
  wrongStatus.supermenu.capability_contract.target_status = "LIVE";
  assert.ok(
    auditMenuArchitecture({ menus, messages, toolbox, submenus: wrongStatus }).errors.includes(
      "supermenu target status must be TARGET_BLOCKED",
    ),
  );

  const registeredOverlap = structuredClone(submenus);
  registeredOverlap.supermenu.capability_contract.target_capabilities.push(
    "operations.exceptions",
  );
  assert.ok(
    auditMenuArchitecture({ menus, messages, toolbox, submenus: registeredOverlap }).errors.some(
      (error) => error.includes("target capability already registered"),
    ),
  );

  const unusedTarget = structuredClone(submenus);
  unusedTarget.supermenu.capability_contract.target_capabilities.push(
    "future.unused_capability",
  );
  assert.ok(
    auditMenuArchitecture({ menus, messages, toolbox, submenus: unusedTarget }).errors.some(
      (error) => error.includes("unused target capability"),
    ),
  );

  const missingReason = structuredClone(submenus);
  missingReason.supermenu.capability_contract.target_reason = "unknown";
  assert.ok(
    auditMenuArchitecture({ menus, messages, toolbox, submenus: missingReason }).errors.includes(
      "supermenu target reason must be not_registered_in_role_toolbox",
    ),
  );
});

test("MJ9 action-time confirmation metadata is mandatory", () => {
  const broken = structuredClone(submenus);
  const browserCategory = broken.supermenu.categories.find(
    (category) => category.code === "MJ",
  );
  const executeItem = browserCategory.items.find((item) => item.code === "MJ9");
  delete executeItem.approval;
  const result = auditMenuArchitecture({ menus, messages, toolbox, submenus: broken });
  assert.equal(result.status, "FAIL");
  assert.ok(
    result.errors.includes("MJ9 explicit action-time confirmation gate missing"),
  );
});
