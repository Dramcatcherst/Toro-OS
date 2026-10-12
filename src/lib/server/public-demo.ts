import "server-only";
import { NextResponse } from "next/server";

/** Fail closed. This is deployment policy, never a cookie, query or user preference. */
export function isPublicDemo(): boolean {
  return process.env.TORO_DEPLOYMENT_MODE !== "internal" && !isPortalDeployment();
}

/** A public hostname may expose only the existing authenticated read surface. */
export function isPortalDeployment(): boolean {
  return process.env.TORO_DEPLOYMENT_MODE === "portal";
}

export function internalCapabilityEnabled(name: string): boolean {
  if (isPublicDemo() || process.env[name] !== "true") return false;
  // Publishing the Portal never enables legacy providers, task writes, MCP or
  // another runtime capability, even if an inherited environment flag is true.
  if (isPortalDeployment()) {
    return name === "TORO_BRAIN_CANONICAL_READ_ENABLED" || name === "TORO_OWNER_ATTENTION_READ_ENABLED";
  }
  return true;
}

export function assertInternalRuntime(): void {
  if (isPublicDemo()) throw new Error("Public demo: operational access is disabled.");
}

export function assertLegacyOperationsEnabled(): void {
  if (!internalCapabilityEnabled("TORO_LEGACY_OPERATIONS_ENABLED")) {
    throw new Error("Legacy operations are disabled.");
  }
}

export function publicDemoResponse() {
  return isPublicDemo()
    ? NextResponse.json({ state: "public_demo", operationalAccess: false },
      { status: 503, headers: { "Cache-Control": "no-store" } })
    : null;
}
