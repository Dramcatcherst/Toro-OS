import { expect, it } from "vitest";
import { authorizedContext } from "@/features/tools/fixtures.test-utils";
import type { ToroRealMenuView } from "@/features/menu/server";
import { hasPortalOrganizationContext, resolvePortalModules } from "./model";

export function portalFixture(): ToroRealMenuView {
  return { context: authorizedContext(), preferredDisplayName: "Synthetic QA", menu: null,
    sourceReadiness: null, profileSummary: [], capabilityNotes: {}, capabilityAlternatives: {},
    focusableCapabilities: [], availableSubmenus: {}, focus: null, state: "resolved" };
}

it.each(["inactive", "other_membership", "unresolved", "personal", "choice"])("never offers domain routes for %s context", reason => {
  const view = portalFixture();
  if (reason === "inactive") view.context.membership!.status = "suspended";
  if (reason === "other_membership") view.context.membership!.orgId = "another-org";
  if (reason === "unresolved") view.context.canUseOrganizationData = false;
  if (reason === "personal") view.context.mode = "personal";
  if (reason === "choice") view.context.requiresContextChoice = true;
  expect(hasPortalOrganizationContext(view.context)).toBe(false);
  expect(resolvePortalModules(view)).toEqual([]);
});

it("does not turn a profile selection failure into a usable Portal", () => {
  const view = portalFixture(); view.state = "no_menu";
  expect(resolvePortalModules(view)).toEqual([]);
  expect(hasPortalOrganizationContext(null)).toBe(false);
});

it("offers a hotel guide without upgrading any financial or staff capability", () => {
  const modules = resolvePortalModules(portalFixture());
  expect(modules).toHaveLength(12);
  expect(modules[5].href).toBe("/my-toro/herramientas");
  expect(modules[2].href).toBeNull();
  expect(modules[6].href).toBeNull();
  expect(modules[0].note).toContain("demostración");
});

it.each(["BLOCKED", "READY", "REQUEST_ACCESS"] as const)("never upgrades %s to a readable project route", state => {
  const view = portalFixture();
  view.menu = { profileId: "manager", selectionReason: "synthetic", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "projects", label: "Projects", emoji: "", aliases: [], capability: "projects.status", state }] };
  view.focusableCapabilities = ["projects.status"];
  expect(resolvePortalModules(view)[10].href).toBeNull();
});

it("requires both source readiness and a permitted focus before offering a consultation", () => {
  const view = portalFixture();
  view.menu = { profileId: "manager", selectionReason: "synthetic", hiddenCapabilityCount: 0,
    items: [{ index: 1, key: "projects", label: "Projects", emoji: "", aliases: [], capability: "projects.status", state: "READ_ONLY" }] };
  expect(resolvePortalModules(view)[10].href).toBeNull();
  view.focusableCapabilities = ["projects.status"];
  expect(resolvePortalModules(view)[10].href).toBe("/my-toro?focus=projects.status");
});

it("keeps hotel access out of another organization and attention scoped to the active membership", () => {
  const view = portalFixture();
  view.context.orgId = "another-org"; view.context.membership!.orgId = "another-org";
  expect(resolvePortalModules(view)[5].href).toBeNull();
  expect(resolvePortalModules(view)[1].href).toBe("/my-toro#owner-attention-heading");
});
