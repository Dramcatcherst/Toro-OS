import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const originalToken = process.env.VERCEL_TOKEN;

beforeEach(() => {
  process.env.VERCEL_TOKEN = "test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalToken === undefined) delete process.env.VERCEL_TOKEN;
  else process.env.VERCEL_TOKEN = originalToken;
});

describe("governed Vercel authority reads", () => {
  it("sanitizes project metadata to the approved read-only projection", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
      new Response(
        JSON.stringify({
          id: "prj_123",
          name: "toro-pr11-preview",
          framework: "nextjs",
          createdAt: 1,
          updatedAt: 2,
          live: false,
          paused: false,
          nodeVersion: "24.x",
          secret: "must-not-escape",
          latestDeployment: {
            id: "dpl_123",
            url: "toro.example.vercel.app",
            readyState: "READY",
            target: null,
            createdAt: 3,
            internalSecret: "must-not-escape",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { readVercelProject } = await import("./read-only-connectors");
    const result = await readVercelProject({
      projectId: "prj_123",
      teamId: "team_123",
    });

    expect(result).toEqual({
      configured: true,
      externalWrite: false,
      mode: "read_only",
      error: null,
      data: {
        id: "prj_123",
        name: "toro-pr11-preview",
        framework: "nextjs",
        createdAt: 1,
        updatedAt: 2,
        live: false,
        paused: false,
        nodeVersion: "24.x",
        latestDeployment: {
          id: "dpl_123",
          url: "toro.example.vercel.app",
          readyState: "READY",
          target: null,
          createdAt: 3,
        },
      },
    });

    const requested = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requested.pathname).toBe("/v9/projects/prj_123");
    expect(requested.searchParams.get("teamId")).toBe("team_123");
  });

  it("paginates domains, labels Vercel aliases, and returns only approved metadata", async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            domains: [
              {
                name: "dreamcatcherhotel.com",
                verified: true,
                createdAt: 10,
                updatedAt: 11,
                secret: "no",
              },
              {
                name: "project.vercel.app",
                verified: true,
                gitBranch: "main",
              },
            ],
            pagination: { next: 12345 },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            domains: [
              {
                name: "www.dreamcatcherhotel.com",
                verified: true,
                redirect: "dreamcatcherhotel.com",
                redirectStatusCode: 308,
              },
            ],
            pagination: {},
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { readVercelProjectDomains } = await import("./read-only-connectors");
    const result = await readVercelProjectDomains({
      projectId: "prj_123",
      teamId: "team_123",
    });

    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        name: "dreamcatcherhotel.com",
        verified: true,
        gitBranch: null,
        redirect: null,
        redirectStatusCode: null,
        createdAt: 10,
        updatedAt: 11,
        isVercelAlias: false,
      },
      {
        name: "project.vercel.app",
        verified: true,
        gitBranch: "main",
        redirect: null,
        redirectStatusCode: null,
        createdAt: null,
        updatedAt: null,
        isVercelAlias: true,
      },
      {
        name: "www.dreamcatcherhotel.com",
        verified: true,
        gitBranch: null,
        redirect: "dreamcatcherhotel.com",
        redirectStatusCode: 308,
        createdAt: null,
        updatedAt: null,
        isVercelAlias: false,
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const second = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(second.searchParams.get("until")).toBe("12345");
  });

  it("fails closed on a repeated pagination cursor", async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
      new Response(
        JSON.stringify({ domains: [], pagination: { next: "same" } }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { readVercelProjectDomains } = await import("./read-only-connectors");
    const result = await readVercelProjectDomains({
      projectId: "prj_123",
      teamId: "team_123",
    });

    expect(result.data).toBeNull();
    expect(result.error).toBe("Vercel domain pagination repeated a cursor.");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not make a request when VERCEL_TOKEN is missing", async () => {
    delete process.env.VERCEL_TOKEN;
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();
    vi.stubGlobal("fetch", fetchMock);

    const { readVercelProject, readVercelProjectDomains } = await import("./read-only-connectors");

    await expect(readVercelProject({ projectId: "prj_123" })).resolves.toMatchObject({
      configured: false,
      data: null,
    });
    await expect(readVercelProjectDomains({ projectId: "prj_123" })).resolves.toMatchObject({
      configured: false,
      data: null,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
