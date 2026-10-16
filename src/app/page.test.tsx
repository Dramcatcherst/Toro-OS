import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const io = vi.hoisted(() => ({ ledger: vi.fn(), health: vi.fn(), records: vi.fn(), redirect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: io.redirect }));
vi.mock("@/lib/server/approval-ledger", () => ({ getApprovalLedger: io.ledger }));
vi.mock("@/lib/server/connector-health", () => ({ getConnectorHealth: io.health }));
vi.mock("@/lib/server/read-only-connectors", () => ({ readAirtableRecords: io.records }));
vi.mock("@/components/operational-console", () => ({ OperationalConsole: () => null }));

import Home from "./page";

beforeEach(() => {
  vi.clearAllMocks();
  io.redirect.mockImplementation((path: string) => { throw new Error(`redirect:${path}`); });
  vi.stubEnv("TORO_BRAIN_CANONICAL_READ_ENABLED", "true");
  vi.stubEnv("TORO_OWNER_ATTENTION_READ_ENABLED", "true");
});
afterEach(() => vi.unstubAllEnvs());

function expectNoLegacyIo() {
  expect(io.ledger).not.toHaveBeenCalled();
  expect(io.health).not.toHaveBeenCalled();
  expect(io.records).not.toHaveBeenCalled();
}

describe("root entry preserves independent deployment/capability gates", () => {
  it.each([undefined, "public-demo", "INTERNAL"])("public mode %s redirects to Brain before legacy reads", async mode => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", mode);
    vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
    await expect(Home()).rejects.toThrow("redirect:/brain");
    expect(io.redirect).toHaveBeenCalledWith("/brain");
    expectNoLegacyIo();
  });

  it.each([undefined, "false", "TRUE", " true ", "invalid"])("internal mode with legacy %s enters Mi TORO without legacy reads", async flag => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", flag);
    await expect(Home()).rejects.toThrow("redirect:/my-toro");
    expect(io.redirect).toHaveBeenCalledWith("/my-toro");
    expectNoLegacyIo();
  });

  it("retains the existing legacy path only behind its explicit flag", async () => {
    vi.stubEnv("TORO_DEPLOYMENT_MODE", "internal");
    vi.stubEnv("TORO_LEGACY_OPERATIONS_ENABLED", "true");
    io.ledger.mockRejectedValueOnce(new Error("legacy-path-sentinel"));
    await expect(Home()).rejects.toThrow("legacy-path-sentinel");
    expect(io.redirect).not.toHaveBeenCalled();
    expect(io.ledger).toHaveBeenCalledOnce();
  });
});
