import { afterEach, describe, expect, it, vi } from "vitest";

import { authorizeOpenClawService } from "./service-auth";

describe("authorizeOpenClawService", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed when the runtime credential is missing", async () => {
    vi.stubEnv("TORO_OPENCLAW_SERVICE_TOKEN", "");

    const result = authorizeOpenClawService(
      new Request("http://localhost/api/brain/openclaw"),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(503);
      await expect(result.response.json()).resolves.toEqual({
        error: "service_auth_unconfigured",
      });
    }
  });

  it("rejects weak configured credentials", () => {
    vi.stubEnv("TORO_OPENCLAW_SERVICE_TOKEN", "too-short");

    const result = authorizeOpenClawService(
      new Request("http://localhost/api/brain/openclaw", {
        headers: { authorization: "Bearer too-short" },
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(503);
  });

  it("rejects missing or incorrect bearer credentials", () => {
    vi.stubEnv("TORO_OPENCLAW_SERVICE_TOKEN", "a".repeat(48));

    const missing = authorizeOpenClawService(
      new Request("http://localhost/api/brain/openclaw"),
    );
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.response.status).toBe(401);

    const wrong = authorizeOpenClawService(
      new Request("http://localhost/api/brain/openclaw", {
        headers: { authorization: `Bearer ${"b".repeat(48)}` },
      }),
    );
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.response.status).toBe(401);
  });

  it("accepts only the dedicated runtime bearer credential", () => {
    const token = "c".repeat(48);
    vi.stubEnv("TORO_OPENCLAW_SERVICE_TOKEN", token);

    const result = authorizeOpenClawService(
      new Request("http://localhost/api/brain/openclaw", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );

    expect(result).toEqual({ ok: true, principal: "openclaw-runtime" });
  });
});
