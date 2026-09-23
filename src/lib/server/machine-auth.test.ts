import { afterEach, describe, expect, it } from "vitest";

import { authorizeOpenClawStatus } from "./machine-auth";

const originalToken = process.env.TORO_OPENCLAW_STATUS_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.TORO_OPENCLAW_STATUS_TOKEN;
  else process.env.TORO_OPENCLAW_STATUS_TOKEN = originalToken;
});

describe("authorizeOpenClawStatus", () => {
  it("fails closed when the machine credential is not configured", () => {
    delete process.env.TORO_OPENCLAW_STATUS_TOKEN;
    const result = authorizeOpenClawStatus(new Request("http://localhost/api/service/operational-status"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });

  it("rejects missing or incorrect bearer credentials", () => {
    process.env.TORO_OPENCLAW_STATUS_TOKEN = "a".repeat(48);

    const missing = authorizeOpenClawStatus(new Request("http://localhost/api/service/operational-status"));
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.response.status).toBe(401);

    const wrong = authorizeOpenClawStatus(
      new Request("http://localhost/api/service/operational-status", {
        headers: { authorization: `Bearer ${"b".repeat(48)}` },
      }),
    );
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.response.status).toBe(401);
  });

  it("accepts only the dedicated scoped bearer credential", () => {
    const token = "c".repeat(48);
    process.env.TORO_OPENCLAW_STATUS_TOKEN = token;

    const result = authorizeOpenClawStatus(
      new Request("http://localhost/api/service/operational-status", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );

    expect(result).toEqual({ ok: true, principal: "openclaw-status-reader" });
  });

  it("rejects weak configured secrets instead of treating them as valid", () => {
    process.env.TORO_OPENCLAW_STATUS_TOKEN = "too-short";
    const result = authorizeOpenClawStatus(
      new Request("http://localhost/api/service/operational-status", {
        headers: { authorization: "Bearer too-short" },
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });
});
