import "server-only";

import { unstable_cache } from "next/cache";

import { buildAirtableReadQuery } from "@/lib/search/airtable-query";
import { getSupabasePublicConfig } from "@/lib/supabase/env";

export type ReadOnlyConnectorResult<T> = {
  configured: boolean;
  externalWrite: false;
  mode: "read_only";
  data: T | null;
  error: string | null;
};

export async function readAirtableRecords(input: {
  baseId: string;
  tableId: string;
  pageSize?: number;
  fields?: string[];
  searchFields?: string[];
  query?: string;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  const token = process.env.AIRTABLE_TOKEN;

  if (!token) {
    return {
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "AIRTABLE_TOKEN is not configured. Returning scaffold metadata only.",
    };
  }

  const url = new URL(`https://api.airtable.com/v0/${encodeURIComponent(input.baseId)}/${encodeURIComponent(input.tableId)}`);
  const params = buildAirtableReadQuery({
    fields: input.fields,
    searchFields: input.searchFields,
    query: input.query,
    pageSize: input.pageSize,
  });

  for (const [key, value] of params.entries()) {
    url.searchParams.append(key, value);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: `Airtable read failed with ${response.status}.`,
    };
  }

  return {
    configured: true,
    externalWrite: false,
    mode: "read_only",
    data: await response.json(),
    error: null,
  };
}

const readAirtableBlueprintSnapshotCached = unstable_cache(
  async (baseId: string, tableId: string) =>
    readAirtableRecords({
      baseId,
      tableId,
      pageSize: 6,
    }),
  ["toro-airtable-blueprint-snapshot-v1"],
  { revalidate: 300 },
);

export async function readAirtableBlueprintSnapshot(input: {
  baseId: string;
  tableId: string;
}) {
  return readAirtableBlueprintSnapshotCached(input.baseId, input.tableId);
}


export type VercelProjectSnapshot = Readonly<{
  id: string | null;
  name: string | null;
  framework: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  live: boolean | null;
  paused: boolean | null;
  nodeVersion: string | null;
  latestDeployment: Readonly<{
    id: string | null;
    url: string | null;
    readyState: string | null;
    target: string | null;
    createdAt: number | null;
  }> | null;
}>;

export type VercelDomainSnapshot = Readonly<{
  name: string;
  verified: boolean | null;
  gitBranch: string | null;
  redirect: string | null;
  redirectStatusCode: number | null;
  createdAt: number | null;
  updatedAt: number | null;
  isVercelAlias: boolean;
}>;

function configuredVercelToken() {
  return process.env.VERCEL_TOKEN?.trim() || null;
}

function unconfiguredVercelResult<T>(): ReadOnlyConnectorResult<T> {
  return {
    configured: false,
    externalWrite: false,
    mode: "read_only",
    data: null,
    error: "VERCEL_TOKEN is not configured. Returning scaffold metadata only.",
  };
}

function normalizeVercelProject(project: Record<string, unknown>): VercelProjectSnapshot {
  const latest =
    project.latestDeployment && typeof project.latestDeployment === "object"
      ? (project.latestDeployment as Record<string, unknown>)
      : null;

  return {
    id: typeof project.id === "string" ? project.id : null,
    name: typeof project.name === "string" ? project.name : null,
    framework: typeof project.framework === "string" ? project.framework : null,
    createdAt: typeof project.createdAt === "number" ? project.createdAt : null,
    updatedAt: typeof project.updatedAt === "number" ? project.updatedAt : null,
    live: typeof project.live === "boolean" ? project.live : null,
    paused: typeof project.paused === "boolean" ? project.paused : null,
    nodeVersion: typeof project.nodeVersion === "string" ? project.nodeVersion : null,
    latestDeployment: latest
      ? {
          id: typeof latest.id === "string" ? latest.id : null,
          url: typeof latest.url === "string" ? latest.url : null,
          readyState: typeof latest.readyState === "string" ? latest.readyState : null,
          target: typeof latest.target === "string" ? latest.target : null,
          createdAt: typeof latest.createdAt === "number" ? latest.createdAt : null,
        }
      : null,
  };
}

function normalizeVercelDomain(domain: Record<string, unknown>): VercelDomainSnapshot | null {
  if (typeof domain.name !== "string" || domain.name.trim() === "") return null;
  const name = domain.name.trim().toLowerCase();

  return {
    name,
    verified: typeof domain.verified === "boolean" ? domain.verified : null,
    gitBranch: typeof domain.gitBranch === "string" ? domain.gitBranch : null,
    redirect: typeof domain.redirect === "string" ? domain.redirect : null,
    redirectStatusCode:
      typeof domain.redirectStatusCode === "number" ? domain.redirectStatusCode : null,
    createdAt: typeof domain.createdAt === "number" ? domain.createdAt : null,
    updatedAt: typeof domain.updatedAt === "number" ? domain.updatedAt : null,
    isVercelAlias: name.endsWith(".vercel.app"),
  };
}

export async function readVercelProject(input: {
  projectId: string;
  teamId?: string;
}): Promise<ReadOnlyConnectorResult<VercelProjectSnapshot>> {
  const token = configuredVercelToken();
  if (!token) return unconfiguredVercelResult<VercelProjectSnapshot>();

  const url = new URL(
    `https://api.vercel.com/v9/projects/${encodeURIComponent(input.projectId)}`,
  );
  if (input.teamId) url.searchParams.set("teamId", input.teamId);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        configured: true,
        externalWrite: false,
        mode: "read_only",
        data: null,
        error: `Vercel project read failed with ${response.status}.`,
      };
    }

    const body = (await response.json()) as Record<string, unknown>;
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: normalizeVercelProject(body),
      error: null,
    };
  } catch {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Vercel project read failed before a response was received.",
    };
  }
}

export async function readVercelProjectDomains(input: {
  projectId: string;
  teamId?: string;
}): Promise<ReadOnlyConnectorResult<readonly VercelDomainSnapshot[]>> {
  const token = configuredVercelToken();
  if (!token) return unconfiguredVercelResult<readonly VercelDomainSnapshot[]>();

  const domains: VercelDomainSnapshot[] = [];
  const seenCursors = new Set<string>();
  let until: string | null = null;

  try {
    for (let page = 0; page < 5; page += 1) {
      const url = new URL(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(input.projectId)}/domains`,
      );
      url.searchParams.set("limit", "100");
      if (input.teamId) url.searchParams.set("teamId", input.teamId);
      if (until) url.searchParams.set("until", until);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) {
        return {
          configured: true,
          externalWrite: false,
          mode: "read_only",
          data: null,
          error: `Vercel domain read failed with ${response.status}.`,
        };
      }

      const body = (await response.json()) as {
        domains?: Record<string, unknown>[];
        pagination?: { next?: string | number | null };
      };
      for (const raw of Array.isArray(body.domains) ? body.domains : []) {
        const normalized = normalizeVercelDomain(raw);
        if (normalized) domains.push(normalized);
      }

      const next =
        body.pagination?.next === undefined || body.pagination?.next === null
          ? null
          : String(body.pagination.next);
      if (!next) break;
      if (seenCursors.has(next)) {
        return {
          configured: true,
          externalWrite: false,
          mode: "read_only",
          data: null,
          error: "Vercel domain pagination repeated a cursor.",
        };
      }
      seenCursors.add(next);
      until = next;
    }

    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: domains,
      error: null,
    };
  } catch {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Vercel domain read failed before a response was received.",
    };
  }
}

export async function readVercelDeployments(input: {
  projectId: string;
  teamId?: string;
}): Promise<ReadOnlyConnectorResult<unknown>> {
  const token = configuredVercelToken();

  if (!token) return unconfiguredVercelResult<unknown>();

  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", input.projectId);
  if (input.teamId) {
    url.searchParams.set("teamId", input.teamId);
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: `Vercel read failed with ${response.status}.`,
    };
  }

  return {
    configured: true,
    externalWrite: false,
    mode: "read_only",
    data: await response.json(),
    error: null,
  };
}

export async function readSupabaseHealth(): Promise<
  ReadOnlyConnectorResult<{ reachable: true }>
> {
  let config: ReturnType<typeof getSupabasePublicConfig>;
  try {
    config = getSupabasePublicConfig();
  } catch {
    return {
      configured: false,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Supabase public config is not configured.",
    };
  }

  const url = new URL("/rest/v1/rooms", config.url);
  url.searchParams.set("select", "id");
  url.searchParams.set("active", "eq.true");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, {
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Accept-Profile": "core",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        configured: true,
        externalWrite: false,
        mode: "read_only",
        data: null,
        error: `Supabase read failed with ${response.status}.`,
      };
    }

    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: { reachable: true },
      error: null,
    };
  } catch {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Supabase read failed before a response was received.",
    };
  }
}

export async function readKrossPublicHealth(): Promise<
  ReadOnlyConnectorResult<{ reachable: true; finalUrl: string }>
> {
  const target = "https://dreamcatcherhotel.kross.travel/";

  try {
    const response = await fetch(target, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return {
        configured: true,
        externalWrite: false,
        mode: "read_only",
        data: null,
        error: `Kross public read failed with ${response.status}.`,
      };
    }

    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: { reachable: true, finalUrl: response.url || target },
      error: null,
    };
  } catch {
    return {
      configured: true,
      externalWrite: false,
      mode: "read_only",
      data: null,
      error: "Kross public read failed before a response was received.",
    };
  }
}
