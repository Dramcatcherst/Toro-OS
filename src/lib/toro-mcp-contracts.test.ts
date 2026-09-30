import { describe, expect, it } from "vitest";

import {
  TORO_MCP_ACTION_LIFECYCLE,
  TORO_MCP_CONTRACT_VERSION,
  TORO_MCP_CORE_TOOL_NAMES,
  TORO_MCP_CORE_TOOLS,
} from "./toro-mcp-contracts";

describe("TORO MCP v1 contract", () => {
  it("pins the v1 contract version", () => {
    expect(TORO_MCP_CONTRACT_VERSION).toBe("1.0.0");
  });

  it("exposes exactly the six approved core business tools", () => {
    expect(TORO_MCP_CORE_TOOL_NAMES).toEqual([
      "get_brain_status",
      "search_toro",
      "get_priorities",
      "get_business_status",
      "get_pending_decisions",
      "get_execution_receipts",
    ]);
    expect(new Set(TORO_MCP_CORE_TOOL_NAMES).size).toBe(6);
  });

  it("keeps every v1 core tool read-only and non-destructive", () => {
    expect(TORO_MCP_CORE_TOOLS).toHaveLength(6);
    for (const tool of TORO_MCP_CORE_TOOLS) {
      expect(tool.readOnlyHint).toBe(true);
      expect(tool.destructiveHint).toBe(false);
      expect(tool.sideEffect).toBe("none");
      expect(["observe", "analyze"]).toContain(tool.actionCeiling);
      expect(tool.approvalRequirement).toBe("None");
      expect(tool.requiredCapabilities.length).toBeGreaterThan(0);
    }
  });

  it("preserves the approved governed action lifecycle", () => {
    expect(TORO_MCP_ACTION_LIFECYCLE).toEqual([
      "Intent",
      "Policy",
      "Approval",
      "Execution",
      "Verification",
      "Receipt",
      "Memory",
    ]);
  });
});
