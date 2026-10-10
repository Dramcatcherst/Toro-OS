import "server-only";
import { NextResponse } from "next/server";

/** Fail closed. This is deployment policy, never a cookie, query or user preference. */
export function isPublicDemo(): boolean {
  return process.env.TORO_DEPLOYMENT_MODE !== "internal";
}

export function internalCapabilityEnabled(name: string): boolean {
  return !isPublicDemo() && process.env[name] === "true";
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
